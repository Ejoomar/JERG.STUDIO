import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

// ── Env vars ──────────────────────────────────────────────
const SUPABASE_URL              = import.meta.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const WEB3FORMS_KEY             = import.meta.env.WEB3FORMS_KEY;
const CALLMEBOT_PHONE           = import.meta.env.CALLMEBOT_PHONE;
const CALLMEBOT_API_KEY         = import.meta.env.CALLMEBOT_API_KEY;

// ── In-memory rate limiter ─────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT   = 5;
const RATE_WINDOW  = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW;
  rateLimitMap.forEach((timestamps, ip) => {
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, recent);
  });
}, 10 * 60 * 1000);

function isRateLimited(ip: string): boolean {
  if (!ip || ip === "unknown") return false; // fail open
  const now    = Date.now();
  const cutoff = now - RATE_WINDOW;
  const hits   = (rateLimitMap.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_LIMIT) return true;
  rateLimitMap.set(ip, [...hits, now]);
  return false;
}

// ── Validation ────────────────────────────────────────────
function validate(body: Record<string, unknown>): string | null {
  const { name, email, service, message } = body;
  if (!name    || typeof name    !== "string" || name.trim().length    < 2)   return "Nombre inválido";
  if (!email   || typeof email   !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email inválido";
  if (!service || typeof service !== "string" || service.trim().length === 0) return "Servicio requerido";
  if (!message || typeof message !== "string" || message.trim().length < 10)  return "Mensaje muy corto";
  if ((name    as string).length > 100)  return "Nombre demasiado largo";
  if ((email   as string).length > 254)  return "Email demasiado largo";
  if ((message as string).length > 2000) return "Mensaje demasiado largo";
  return null;
}

// ── Fire-and-forget: Email via Web3Forms ──────────────────
async function notifyEmail(
  name: string, email: string, phone: string, service: string, message: string
): Promise<void> {
  if (!WEB3FORMS_KEY) return;
  await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject:    `Nuevo contacto: ${service} — ${name}`,
      from_name:  "JERG.STUDIO Contacto",
      replyto:    email,
      name,
      email,
      phone:      phone || "—",
      service,
      message,
    }),
  });
}

// ── Fire-and-forget: WhatsApp ──────────────────────────────
async function notifyWhatsApp(
  name: string, email: string, service: string
): Promise<void> {
  if (!CALLMEBOT_API_KEY || !CALLMEBOT_PHONE) return;
  if (CALLMEBOT_API_KEY === "PENDIENTE" || CALLMEBOT_API_KEY === "pendiente") return;
  const text = encodeURIComponent(
    `🚀 Nuevo lead JERG.STUDIO\nNombre: ${name}\nEmail: ${email}\nServicio: ${service}`
  );
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_PHONE)}&text=${text}&apikey=${encodeURIComponent(CALLMEBOT_API_KEY)}`;
  await fetch(url);
}

// ── Main handler ──────────────────────────────────────────
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? clientAddress
    ?? "unknown";

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate
  const validationError = validate(body);
  if (validationError) {
    return new Response(JSON.stringify({ error: validationError }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name    = (body.name    as string).trim();
  const email   = (body.email   as string).trim();
  const phone   = (body.phone   as string | undefined)?.trim() ?? "";
  const service = (body.service as string).trim();
  const message = (body.message as string).trim();

  // ── Save to Supabase (non-blocking — never fails the request) ─
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error: dbError } = await supabase
        .from("contact_submissions")
        .insert({ name, email, phone, service, message, ip });
      if (dbError) console.error("Supabase error:", dbError);
    } catch (err) {
      console.error("Supabase exception:", err);
    }
  }

  // ── Fire-and-forget notifications (don't block 200) ───────
  Promise.allSettled([
    notifyEmail(name, email, phone, service, message),
    notifyWhatsApp(name, email, service),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Notification ${i} failed:`, r.reason);
      }
    });
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
