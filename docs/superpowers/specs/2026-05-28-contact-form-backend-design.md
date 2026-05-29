# Contact Form Backend — Design Spec
**Date:** 2026-05-28
**Status:** Approved

## Overview

Wire up the existing `ContactForm.astro` UI to a real backend: an Astro API route that validates submissions, persists them to Supabase, and sends instant notifications via Resend (email) and CallMeBot (WhatsApp).

---

## Architecture

```
Browser (ContactForm.astro)
  └─ POST /api/contact (JSON)
       │
       ├─ 1. Server-side validation         → 400 on failure
       ├─ 2. Rate limit: 3 req / 10 min / IP → 429 on exceeded
       ├─ 3. INSERT contact_submissions      → 500 on failure (stops here)
       └─ 4. Fire-and-forget notifications
               ├─ Resend email → hola@jerg.studio
               └─ CallMeBot WhatsApp → configured phone
                     → 200 to browser
```

**Key principle:** Supabase insert is the critical path. Notifications are non-blocking — if they fail, the lead is never lost.

---

## Database Schema (Supabase)

```sql
create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text not null,
  message     text not null,
  status      text not null default 'new',  -- new | read | replied
  ip          text,
  created_at  timestamptz not null default now()
);

alter table contact_submissions enable row level security;
-- No public policies: table is fully private, accessible only via service role key
```

**`status`** field allows marking leads as read/replied from Supabase Studio without extra code.
**`ip`** field enables basic spam detection via rate limiting in the API route.

---

## API Route

**File:** `src/pages/api/contact.ts`
**Method:** `POST`
**Content-Type:** `application/json`

### Request body
```typescript
{
  name: string       // required, minLength 2
  email: string      // required, valid email format
  phone?: string     // optional
  service: string    // required, must match one of the serviceOptions enum
  message: string    // required, minLength 20
}
```

### Response codes
| Code | Meaning |
|------|---------|
| 200 | Success — saved and notifications attempted |
| 400 | Validation error — body contains `{ error: string }` |
| 429 | Rate limited — body contains `{ error: 'Too many requests' }` |
| 500 | Database error — body contains `{ error: 'Server error' }` |

### Rate limiting
In-memory `Map<ip, number[]>` storing timestamps of recent requests per IP.
Max 3 submissions per 10-minute window. Sufficient for a landing page (single process).
No Redis dependency required.

### Validation
Server-side mirrors client-side rules:
- `name`: non-empty, minLength 2
- `email`: non-empty, valid email regex
- `service`: non-empty, one of the allowed service options
- `message`: non-empty, minLength 20
- `phone`: optional, no validation

### Notifications (fire-and-forget)

Both run inside a `Promise.allSettled` after the successful DB insert.
Failures are logged to console but do not affect the 200 response.

**Resend email:**
- To: `hola@jerg.studio`
- Subject: `Nuevo lead: {service} — {name}`
- Body: HTML table with all submission fields + link to Supabase Studio

**CallMeBot WhatsApp:**
- GET request to CallMeBot webhook URL
- Message: `🔔 Nuevo lead\n👤 {name}\n📧 {email}\n🛠 {service}`
- URL-encoded, max ~160 chars

---

## Frontend Changes

**File:** `src/components/ContactForm.astro`

Only the `<script>` block changes. HTML, styles, and validation logic are untouched.

Replace the mock submit simulation with a real `fetch`:

```typescript
// Replace the mock block starting at line 288
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

  // Existing success display code (unchanged)
  form.querySelectorAll<HTMLElement>('.grid, .mt-4, button[type="submit"]')
    .forEach(el => { el.style.display = 'none'; });
  successMsg.classList.remove('hidden');
  successMsg.classList.add('flex');

} catch {
  submitText.textContent = 'Error de red. Intenta de nuevo.';
  submitBtn.disabled = false;
}
```

---

## Astro Configuration

Activate hybrid mode so the rest of the site stays fully static:

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'hybrid',   // was: 'static' or not set
  // ... rest unchanged
});
```

Add `export const prerender = false;` at the top of `src/pages/api/contact.ts`.

---

## Environment Variables

```bash
# .env (never commit)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # service role, NOT anon key

RESEND_API_KEY=re_...

CALLMEBOT_PHONE=56967657198       # your number, country code, no +
CALLMEBOT_API_KEY=xxxxxxxx        # from CallMeBot activation
```

---

## Dependencies

```bash
npm install @supabase/supabase-js resend
```

No other new dependencies. Rate limiting uses native `Map`, no Redis.

---

## File Checklist

| File | Action |
|------|--------|
| `astro.config.mjs` | Set `output: 'hybrid'` |
| `src/pages/api/contact.ts` | Create — full API route |
| `src/components/ContactForm.astro` | Edit script block only |
| `.env` | Add 5 env vars |
| `supabase/migrations/001_contact_submissions.sql` | Create — table migration |
| `package.json` | Add `@supabase/supabase-js`, `resend` |

---

## Out of Scope

- Email template with brand styling (plain HTML table is sufficient for notifications)
- Admin dashboard for viewing leads (use Supabase Studio)
- CAPTCHA / honeypot (rate limiting by IP is sufficient for this volume)
- Double opt-in confirmation email to the lead
