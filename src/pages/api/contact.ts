export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SERVICE_OPTIONS = [
  'Página Web (landing, corporativa)',
  'E-commerce / Tienda Online',
  'Sistema a Medida (CRM, inventario…)',
  'Aplicación Web o Móvil',
  'Automatizaciones y Bots',
  'Mantenimiento y Soporte',
  'Otro',
] as const;

// In-memory rate limiter: ip → list of request timestamps within the window
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  rateLimitMap.set(ip, [...recent, now]);
  return false;
}

interface ContactData {
  name: string;
  email: string;
  phone: string | null;
  service: string;
  message: string;
}

function validateBody(body: unknown): { ok: true; data: ContactData } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Cuerpo de solicitud inválido.' };
  const b = body as Record<string, unknown>;

  const name    = typeof b.name    === 'string' ? b.name.trim()    : '';
  const email   = typeof b.email   === 'string' ? b.email.trim()   : '';
  const phone   = typeof b.phone   === 'string' ? b.phone.trim()   : '';
  const service = typeof b.service === 'string' ? b.service.trim() : '';
  const message = typeof b.message === 'string' ? b.message.trim() : '';

  if (name.length < 2)
    return { ok: false, error: 'Nombre requerido (mín. 2 caracteres).' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: 'Email inválido.' };
  if (!(SERVICE_OPTIONS as readonly string[]).includes(service))
    return { ok: false, error: 'Servicio inválido.' };
  if (message.length < 20)
    return { ok: false, error: 'Mensaje requerido (mín. 20 caracteres).' };

  return { ok: true, data: { name, email, phone: phone || null, service, message } };
}

async function notifyEmail(data: ContactData & { created_at: string }) {
  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'onboarding@resend.dev',   // change to verified domain address in production
    to: 'hola@jerg.studio',
    subject: `Nuevo lead: ${data.service} — ${data.name}`,
    html: `
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:600px">
        <tr>
          <th colspan="2" style="background:#10b981;color:#fff;padding:12px;text-align:left">
            Nuevo lead recibido
          </th>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;font-weight:bold;width:120px">Nombre</td>
          <td style="padding:8px;border:1px solid #eee">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;font-weight:bold">Email</td>
          <td style="padding:8px;border:1px solid #eee">
            <a href="mailto:${data.email}">${data.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;font-weight:bold">Teléfono</td>
          <td style="padding:8px;border:1px solid #eee">${data.phone ?? '—'}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;font-weight:bold">Servicio</td>
          <td style="padding:8px;border:1px solid #eee">${data.service}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;font-weight:bold">Mensaje</td>
          <td style="padding:8px;border:1px solid #eee;white-space:pre-wrap">${data.message}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;font-weight:bold">Fecha</td>
          <td style="padding:8px;border:1px solid #eee">
            ${new Date(data.created_at).toLocaleString('es-CL')}
          </td>
        </tr>
      </table>
    `,
  });
}

async function notifyWhatsApp(data: ContactData) {
  const phone  = import.meta.env.CALLMEBOT_PHONE;
  const apiKey = import.meta.env.CALLMEBOT_API_KEY;
  const text   = encodeURIComponent(
    `Nuevo lead\nNombre: ${data.name}\nEmail: ${data.email}\nServicio: ${data.service}`
  );
  const res = await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apiKey}`
  );
  if (!res.ok) throw new Error(`CallMeBot responded ${res.status}`);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress ?? 'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateBody(body);
  if (!validation.ok) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data } = validation;

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: row, error } = await supabase
    .from('contact_submissions')
    .insert({ ...data, ip })
    .select('id, created_at')
    .single();

  if (error || !row) {
    console.error('[contact] Supabase insert error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Notifications run after the 200 is returned — failures never lose the lead
  Promise.allSettled([
    notifyEmail({ ...data, created_at: row.created_at }),
    notifyWhatsApp(data),
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[contact] Notification ${i} failed:`, r.reason);
      }
    });
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
