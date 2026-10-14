# AdCash Rewards – Watch Ads & Earn

Complete earning platform with video ads, tasks, referrals, and admin portal.

## Features

- Real video ads (watch to the end to claim)
- Tasks (surveys, installs, daily check-in, offers)
- Referral system ($10 bonus – configurable in admin)
- Withdrawals: Bitcoin, PayPal, Amazon Gift Card ($50 min – configurable)
- Full Admin portal
- Support tickets

## Demo Accounts

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@watchads.com   | admin123  |
| User  | demo@watchads.com    | user123   |

---

## Free Hosting (Vercel + Neon)

### 1. Create a free database (Neon)

1. Go to https://neon.tech and sign up with GitHub
2. Create a new project
3. Copy the **connection string** (starts with `postgresql://...`)

### 2. Push code to GitHub

```bash
cd watch-ads-earn
git init
git add .
git commit -m "AdCash Rewards"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/adcash-rewards.git
git push -u origin main
```

### 3. Deploy on Vercel (free)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **New Project** → Import your repo
3. Add these **Environment Variables**:

| Name             | Value                                      |
|------------------|--------------------------------------------|
| `DATABASE_URL`   | Your Neon connection string                |
| `NEXTAUTH_SECRET`| Any long random text (e.g. `mySecretKey99xyz`) |
| `NEXTAUTH_URL`   | `https://your-project.vercel.app` (update after first deploy) |

4. Click **Deploy**

### 4. Set up the database

After the first deploy, open the Vercel terminal or run locally once:

```bash
npx prisma db push
npm run db:seed
```

Or add a one-time script. Easiest way:

- Install Vercel CLI: `npm i -g vercel`
- Run: `vercel env pull .env.local`
- Then: `npx prisma db push && npm run db:seed`

### 5. Update NEXTAUTH_URL

After deployment, go back to Vercel → Settings → Environment Variables  
and set `NEXTAUTH_URL` to your real domain (e.g. `https://adcash-rewards.vercel.app`)

Redeploy once.

Your site is now live for free!

---

## Local Development

```bash
cp .env.example .env
# Put your Neon DATABASE_URL in .env (or use a local Postgres)

npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

---

## Admin Settings

Go to `/admin/settings` to change:
- Referral reward amount
- Minimum withdrawal amount
