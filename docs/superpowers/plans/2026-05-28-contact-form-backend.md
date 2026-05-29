# Contact Form Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the existing `ContactForm.astro` UI to a real backend: save submissions to Supabase and send instant notifications via Resend (email) + CallMeBot (WhatsApp).

**Architecture:** Astro hybrid mode with a single `POST /api/contact` endpoint. The endpoint validates input, rate-limits by IP (in-memory), inserts the lead into Supabase as the critical path, then fires notifications asynchronously so a failed email/WhatsApp never loses a lead.

**Tech Stack:** Astro 4 (hybrid mode), @astrojs/netlify adapter, @supabase/supabase-js, Resend SDK, CallMeBot webhook (fetch), TypeScript.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `astro.config.mjs` | Modify | Add hybrid output + Netlify adapter |
| `src/pages/api/contact.ts` | Create | Full API route: validate → rate-limit → save → notify |
| `src/components/ContactForm.astro` | Modify | Replace mock submit with real fetch |
| `supabase/migrations/001_contact_submissions.sql` | Create | DB schema for leads table |
| `.env` | Create (local only) | Runtime secrets (never commit) |
| `.env.example` | Create | Template for env vars (safe to commit) |

---

## Task 1: Install dependencies and configure Astro hybrid mode

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1.1: Install new packages**

Run in the project root:
```bash
npm install @supabase/supabase-js resend @astrojs/netlify
```

Expected output: packages added to `node_modules` and `package.json` dependencies.

- [ ] **Step 1.2: Update astro.config.mjs**

Replace the entire file content with:
```typescript
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import netlify from "@astrojs/netlify";

export default defineConfig({
  site: "https://astro-moon-landing.netlify.app/",
  output: "hybrid",
  adapter: netlify(),
  integrations: [tailwind(), icon()],
});
```

- [ ] **Step 1.3: Verify dev server still starts**

```bash
npm run dev
```

Expected: server starts on `http://localhost:4321` with no errors. Press Ctrl+C to stop.

- [ ] **Step 1.4: Commit**

```bash
git add astro.config.mjs package.json package-lock.json
git commit -m "feat: enable Astro hybrid mode with Netlify adapter"
```

---

## Task 2: Create Supabase SQL migration

**Files:**
- Create: `supabase/migrations/001_contact_submissions.sql`

- [ ] **Step 2.1: Create migration file**

Create the directory and file `supabase/migrations/001_contact_submissions.sql` with:

```sql
create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text not null,
  message     text not null,
  status      text not null default 'new',
  ip          text,
  created_at  timestamptz not null default now()
);

-- Disable public access: only accessible via service role key
alter table contact_submissions enable row level security;
```

- [ ] **Step 2.2: Apply the migration in Supabase Studio**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and open your project.
2. Click **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the entire SQL from `001_contact_submissions.sql`.
5. Click **Run**.
6. Expected: "Success. No rows returned."
7. Verify: click **Table Editor** → you should see `contact_submissions` in the list.

- [ ] **Step 2.3: Commit the migration file**

```bash
git add supabase/migrations/001_contact_submissions.sql
git commit -m "feat: add contact_submissions table migration"
```

---

## Task 3: Configure environment variables

**Files:**
- Create: `.env` (local only — already in .gitignore)
- Create: `.env.example` (safe to commit)

- [ ] **Step 3.1: Collect your credentials**

You need 5 values:

**Supabase** (from your project dashboard → Settings → API):
- `SUPABASE_URL` — looks like `https://abcdefgh.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` key (NOT the `anon` key). Starts with `eyJ`.

**Resend** (from [https://resend.com/api-keys](https://resend.com/api-keys)):
- `RESEND_API_KEY` — starts with `re_`.

> ⚠️ **Important:** Resend's sandbox mode only delivers to your Resend-registered email. To receive notifications at `hola@jerg.studio`, you must first verify the `jerg.studio` domain in Resend → Domains → Add Domain, and add the required DNS records. Until then, emails go to your Resend account email.

**CallMeBot** (one-time setup):
- Send `I allow callmebot to send me messages` to `+34 644 59 97 44` on WhatsApp.
- You will receive a reply with your API key.
- `CALLMEBOT_PHONE` — your number with country code, no `+`. Example: `56967657198`
- `CALLMEBOT_API_KEY` — the key you received from CallMeBot.

- [ ] **Step 3.2: Create .env**

Create `.env` in the project root (never commit this file):

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...YOUR_SERVICE_ROLE_KEY
RESEND_API_KEY=re_YOUR_RESEND_API_KEY
CALLMEBOT_PHONE=56967657198
CALLMEBOT_API_KEY=YOUR_CALLMEBOT_KEY
```

- [ ] **Step 3.3: Create .env.example**

Create `.env.example` in the project root with placeholders (this IS committed):

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
CALLMEBOT_PHONE=56XXXXXXXXX
CALLMEBOT_API_KEY=XXXXXXXX
```

- [ ] **Step 3.4: Commit .env.example only**

```bash
git add .env.example
git commit -m "chore: add .env.example with required variables"
```

---

## Task 4: Create the API route

**Files:**
- Create: `src/pages/api/contact.ts`

- [ ] **Step 4.1: Create the directory and file**

Create `src/pages/api/contact.ts` with this complete implementation:

```typescript
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
```

- [ ] **Step 4.2: Start dev server**

```bash
npm run dev
```

Leave it running in this terminal.

- [ ] **Step 4.3: Test validation — missing required field**

Open a new terminal and run:

```bash
curl.exe -s -X POST http://localhost:4321/api/contact `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"A\",\"email\":\"test@test.com\",\"service\":\"Otro\",\"message\":\"msg\"}"
```

Expected response:
```json
{"error":"Nombre requerido (mín. 2 caracteres)."}
```

HTTP status: `400`

- [ ] **Step 4.4: Test validation — invalid email**

```bash
curl.exe -s -X POST http://localhost:4321/api/contact `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Juan\",\"email\":\"notanemail\",\"service\":\"Otro\",\"message\":\"mensaje de prueba con veinte caracteres minimo\"}"
```

Expected response:
```json
{"error":"Email inválido."}
```

- [ ] **Step 4.5: Test valid submission (saves to Supabase)**

```bash
curl.exe -s -X POST http://localhost:4321/api/contact `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Juan Pérez\",\"email\":\"juan@example.com\",\"service\":\"Otro\",\"message\":\"Hola quiero información sobre sus servicios de desarrollo web\"}"
```

Expected response:
```json
{"ok":true}
```

Then verify in Supabase Studio → Table Editor → `contact_submissions`: you should see a new row with the data above.

- [ ] **Step 4.6: Test rate limiting**

Send the same valid request 4 times quickly. The 4th should return:
```json
{"error":"Too many requests"}
```
HTTP status: `429`

- [ ] **Step 4.7: Commit**

```bash
git add src/pages/api/contact.ts
git commit -m "feat: add POST /api/contact — validate, rate-limit, save to Supabase, fire-and-forget notifications"
```

---

## Task 5: Connect the frontend to the API

**Files:**
- Modify: `src/components/ContactForm.astro` (script block only, lines 283–297)

- [ ] **Step 5.1: Replace the mock submit handler**

In `src/components/ContactForm.astro`, find this block (around line 283):

```typescript
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll<HTMLInputElement>('.cf-input')];
    if (!inputs.map(validate).every(Boolean)) return;

    submitBtn.disabled = true;
    submitText.textContent = 'Enviando…';
    await new Promise(r => setTimeout(r, 1000));

    form.querySelectorAll<HTMLElement>('.grid, .mt-4, button[type="submit"]').forEach(el => {
      el.style.display = 'none';
    });
    successMsg.classList.remove('hidden');
    successMsg.classList.add('flex');
  });
```

Replace it entirely with:

```typescript
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll<HTMLInputElement>('.cf-input')];
    if (!inputs.map(validate).every(Boolean)) return;

    const name    = (form.querySelector('#cf-name')    as HTMLInputElement).value.trim();
    const email   = (form.querySelector('#cf-email')   as HTMLInputElement).value.trim();
    const phone   = (form.querySelector('#cf-phone')   as HTMLInputElement).value.trim();
    const service = (form.querySelector('#cf-service') as HTMLSelectElement).value;
    const message = (form.querySelector('#cf-message') as HTMLTextAreaElement).value.trim();

    submitBtn.disabled = true;
    submitText.textContent = 'Enviando…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, service, message }),
      });

      if (res.status === 429) {
        submitText.textContent = 'Demasiados intentos. Espera unos minutos.';
        submitBtn.disabled = false;
        return;
      }

      if (!res.ok) {
        submitText.textContent = 'Error al enviar. Intenta de nuevo.';
        submitBtn.disabled = false;
        return;
      }

      form.querySelectorAll<HTMLElement>('.grid, .mt-4, button[type="submit"]').forEach(el => {
        el.style.display = 'none';
      });
      successMsg.classList.remove('hidden');
      successMsg.classList.add('flex');

    } catch {
      submitText.textContent = 'Error de red. Intenta de nuevo.';
      submitBtn.disabled = false;
    }
  });
```

- [ ] **Step 5.2: Verify the dev server is running**

```bash
npm run dev
```

Open `http://localhost:4321` in a browser and scroll to the contact section.

- [ ] **Step 5.3: Browser smoke test — happy path**

1. Fill in: Nombre = `Test User`, Email = `test@example.com`, Servicio = `Otro`, Mensaje = `Este es un mensaje de prueba con más de veinte caracteres`.
2. Click **Enviar mensaje**.
3. Expected: button shows "Enviando…" briefly, then the form disappears and the green success message appears.
4. Verify the row in Supabase Studio → Table Editor → `contact_submissions`.

- [ ] **Step 5.4: Browser smoke test — network error simulation**

1. Open browser DevTools → Network tab → set throttling to **Offline**.
2. Fill in the form and submit.
3. Expected: button re-enables and shows "Error de red. Intenta de nuevo."
4. Set throttling back to **No throttling**.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/ContactForm.astro
git commit -m "feat: wire contact form to POST /api/contact"
```

---

## Task 6: Production checklist before deploying

- [ ] **Step 6.1: Verify Resend domain (for production email delivery)**

1. Go to [https://resend.com/domains](https://resend.com/domains).
2. Click **Add Domain** → enter `jerg.studio`.
3. Add the DNS records Resend shows you to your domain registrar.
4. Wait for verification (usually 5–30 minutes).
5. Once verified, in `src/pages/api/contact.ts` change:
   ```typescript
   from: 'onboarding@resend.dev',
   ```
   to:
   ```typescript
   from: 'Contacto JERG Studio <hola@jerg.studio>',
   ```
6. Commit:
   ```bash
   git add src/pages/api/contact.ts
   git commit -m "fix: use verified domain as Resend sender"
   ```

- [ ] **Step 6.2: Add environment variables in Netlify**

1. Go to Netlify → your site → **Site configuration** → **Environment variables**.
2. Add all 5 variables from `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `CALLMEBOT_PHONE`
   - `CALLMEBOT_API_KEY`

- [ ] **Step 6.3: Deploy and test in production**

```bash
git push origin main
```

After the Netlify deploy completes:
1. Open the live site and submit the contact form with real data.
2. Confirm the row appears in Supabase Studio.
3. Confirm the notification email arrives at `hola@jerg.studio`.
4. Confirm the WhatsApp message arrives on your phone.

---

## Reference: curl test commands (Windows PowerShell)

Valid submission (copy-paste ready):
```powershell
curl.exe -s -X POST http://localhost:4321/api/contact `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Juan Perez\",\"email\":\"juan@example.com\",\"service\":\"Otro\",\"message\":\"Mensaje de prueba con mas de veinte caracteres para pasar validacion\"}"
```

Rate-limit test (run 4 times quickly):
```powershell
1..4 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" -X POST http://localhost:4321/api/contact `
    -H "Content-Type: application/json" `
    -d "{\"name\":\"Test\",\"email\":\"t@t.com\",\"service\":\"Otro\",\"message\":\"Mensaje de prueba con mas de veinte caracteres\"}"
}
```

Expected output: `200 200 200 429`
