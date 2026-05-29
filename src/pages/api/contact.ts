import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const TO_EMAIL = "Jerg.studio@gmail.com";

// Simple in-memory rate limit: max 5 submissions per IP per 10 minutes
const rateMap = new Map<string, { count: number; ts: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.ts > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, ts: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export const POST: APIRoute = async ({ request }) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, phone, service, message } = body;

  if (!name || !email || !service || !message) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resend = new Resend(RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "JERG.STUDIO Contacto <onboarding@resend.dev>",
    to: TO_EMAIL,
    reply_to: email,
    subject: `Nuevo contacto: ${service} — ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#10b981;margin-bottom:24px">Nuevo mensaje de contacto</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#666;width:120px"><strong>Nombre</strong></td><td style="padding:8px 0">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Email</strong></td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Teléfono</strong></td><td style="padding:8px 0">${phone || "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#666"><strong>Servicio</strong></td><td style="padding:8px 0">${service}</td></tr>
        </table>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
        <p style="color:#666;margin-bottom:8px"><strong>Mensaje:</strong></p>
        <p style="background:#f9f9f9;padding:16px;border-radius:8px;white-space:pre-wrap">${message}</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
