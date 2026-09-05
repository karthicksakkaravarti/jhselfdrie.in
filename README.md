# JH Self Drive

Conversion-focused website and enquiry capture system for JH Self Drive, Ramanathapuram.

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase service-role credentials.
2. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
3. Install and start: `npm install && npm run dev`.

The page itself renders without Supabase credentials. Form submissions and first-party analytics require them.

## Before launch

- Replace all `TODO` values in `src/content/site.ts`.
- Rotate the credential previously committed in `initial.md`; it remains in Git history.
- Set all `.env.example` variables in Vercel and connect `jhselfdrive.in`.
- Verify RLS using the browser anon client, GA4 DebugView and the repeat-phone enquiry scenario from the product brief.

## Security model

No Supabase key is shipped to the browser. Server code uses the service-role key; all customer-facing tables have RLS enabled with no public policy. Enquiries are protected by a honeypot, a minimum completion time and a hashed-IP rate limit of five attempts per hour.
