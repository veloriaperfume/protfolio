Hamza Portfolio — Deployment & Form Instructions

Quick goal
- Deploy this static portfolio to Vercel (free tier).
- Receive contact emails using FormSubmit (free static form receiver) or replace with your serverless endpoint.

Steps to deploy to Vercel
1. Create a Git repo in the `d:\protfolio` folder and commit files:
   - git init
   - git add .
   - git commit -m "Initial portfolio"
2. Push to GitHub (create a remote repo):
   - git remote add origin <your-repo-url>
   - git push -u origin main
3. Go to https://vercel.com, sign in with GitHub, and import the repository.
   - Vercel will detect a static site; use default settings and deploy.

Form (receive emails)
- The contact form in `index.html` uses FormSubmit (https://formsubmit.co).
- Replace the placeholder email `your-email@example.com` in the form `action` attribute with your real email before pushing.
  Example: action="https://formsubmit.co/hamza@example.com"
- Optionally set a `_next` hidden input to redirect to a thank-you page after submission.
- FormSubmit will send a confirmation email the first time you use it — follow instructions to enable delivery.

Security notes
- A stricter Content-Security-Policy header is present via a meta tag. For best results, configure CSP as an HTTP header from your hosting/proxy.
- Keep external links to trusted domains. If you add analytics or third-party scripts, update the CSP accordingly.
- FormSubmit is a low-friction solution for static sites. For production-grade privacy/security, use a serverless function or an authenticated email service.

Next steps I can help with
- Replace FormSubmit with a serverless function on Vercel that sends mail via an SMTP or API provider (SendGrid, Mailgun). Some of these have бесплатный/free tiers.
- Add a custom domain and set up HTTPS.
