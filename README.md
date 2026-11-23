# WedPlan — Frontend

Next.js App Router React website for WedPlan.
See `../README-START-HERE.md` for full setup, deployment and testing.

Quick start:
```powershell
npm.cmd install
npm.cmd run dev
```

Configure API_SERVER_URL in Vercel as your Render server URL.
Client uses the same-origin `/api` rewrite to communicate with Express.

### Features
Landing page, dynamic MongoDB services, category search, location filter,
price sorting, account creation, email/password and Google sign in,
booking, Customer/Vendor/Admin dashboards, profile editing and subscriptions.

**Caution:** Real Google OAuth, MongoDB, Stripe and ImgBB integrations
must be configured and tested with your own credentials.
