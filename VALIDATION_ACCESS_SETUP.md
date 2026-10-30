# Physician Validation — access and language

The validation login shows the demo code **nassrlina2003**, as requested. This is a **public demo hint, not a secret**. Do not use this visible code to secure real patient data.

Access is checked server-side against environment variables. In `.env.local` (development) or Vercel project settings, set:

```dotenv
PHYSICIAN_REVIEW_ACCESS_CODE=nassrlina2003
PHYSICIAN_REVIEW_SESSION_SECRET=<random secret at least 32 characters>
```

Use a strong random session secret. Restart `npm run dev` after editing `.env.local`; redeploy after changing Vercel environment variables. Never commit your actual session secret.

The visible login hint does not automatically change a deployed environment variable. If a different code is configured on the server, that code will continue to be required until updated.

The language selectors on the gate and validation workspace are now explicitly styled in high-contrast text. Reviewer ID defaults to `Doctor1`, but remains editable.
