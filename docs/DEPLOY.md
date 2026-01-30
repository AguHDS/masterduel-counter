### Development Setup

The application is configured to work without email verification in development:

- `REQUIRE_EMAIL_VERIFICATION=false` - Users can register without verifying email
- For Captcha, Cloudflare Turnstile uses test mode if no secret key is provided

### Production Setup

When deploying to production, follow these steps:

```env
REQUIRE_EMAIL_VERIFICATION=true
```

This makes email verification **mandatory** for new user registrations.

#### Environment Configuration (URLS)

Set the environment to production to automatically switch URLs:

```env
NODE_ENV=production
VITE_QUERY_ENV=production
```

This will:

- Switch all URLs from `http://localhost:*` to `https://masterduelcounter.com`
- Enable secure cookies
- Use production CORS settings

### Troubleshooting

**Emails not sending:**

- Check Brevo dashboard for sending limits
- Verify SMTP credentials
- Check console logs for SMTP errors
- Ensure port 587 is not blocked by firewall

**Email verification failing:**

- Check token expiration (24 hours default)
- Verify database `Verification` table exists
- Check console logs for detailed error messages

**CAPTCHA not working:**

- Verify Turnstile secret key is correct
- Check that site key in frontend matches the secret key
- Ensure domain is whitelisted in Turnstile dashboard
