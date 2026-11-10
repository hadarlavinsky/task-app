# Task App: Fullstack SaaS Project Tutorial 2025

> **About this copy.** This repository is a copy (not a GitHub fork) of
> [pixegami/task-app](https://github.com/pixegami/task-app) by Pixegami, taken on
> October 16, 2026 from commit
> [`60a0b1e`](https://github.com/pixegami/task-app/commit/60a0b1e56ee567cf8ff417c44139bbbd5fd7b137)
> ("fix: Add Stripe SK via SQL Editor instead of a migration", January 25, 2025), with
> its full commit history. It is maintained by Y. Rosenthal for a university course,
> with fixes so that the app works with the current versions of Supabase, Next.js and
> the other services. Changes made after the copy are in this repository's commit
> history. The original license, [CC BY-NC 4.0](LICENSE.md), still applies.

## My setup (Hadar Lavinsky, Classes 10–12 project)

I set up and connected my own copy of this app as part of the course's task-app project:

| Service | What it does in my app | Status |
| --- | --- | --- |
| Supabase (project `task-app-2026-hadar`) | Database, sign-in, image storage, Edge Functions | ✅ Working |
| Google sign-in | "Sign in with Google" through Supabase Auth | ✅ Working |
| OpenAI (`gpt-4o-mini`) | Gives every new task an automatic label | ✅ Working |
| Stripe (test mode) | "TaskMaster Premium" subscription at $10/month, plus the customer portal | ✅ Working |
| Vercel | Puts the app online | ⏳ Next step |

Tested on my computer (`npm run dev`, http://localhost:3000): signing in with Google, creating a task that got
an AI label, attaching an image, upgrading to Premium with Stripe's test card, and opening the customer portal.

All keys and passwords stay in `.env.local` (ignored by Git) and in Supabase secrets, never in this repository.

---

A full-stack SaaS task management application built with Next.js and Supabase, featuring AI-powered task labeling, image attachments, and Stripe subscriptions.

- Specific tutorial documents can be found in the `/tutorial` folder.
- Project design and spec can be found at [tutorial/PROJECT_DESIGN.md](tutorial/PROJECT_DESIGN.md).

![image-app-dashboard](tutorial/images/task-dashboard.png)

## Features

- Task management with automatic AI labeling
- Image attachments with cloud storage
- Google OAuth and email authentication
- Premium subscription with Stripe integration
- Usage limits and tracking

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- AI: OpenAI
- Payments: Stripe

## Quick Start

### Prerequisites

- Node.js and npm
- Supabase CLI
- Stripe CLI (optional)
- Account credentials for:
  - Supabase
  - OpenAI
  - Stripe (test mode)

### Local Development Setup

1. Clone and install dependencies:

```bash
# From project root.
npm install
```

2. Create environment files, then replace the XXXX values with your own (the comments in each file say where to find them). `.env.local` is for running the app; `.env.test.local` is only for the automated tests (`npm test`).
```bash
cp .env.example .env.local
cp .env.test.example .env.test.local
```

3. Run development server:
```bash
npm run dev
# Visit http://localhost:3000
```

At this stage, it won't work well yet because we haven't set up the backend.

### Supabase Setup

1. Create new Supabase project at supabase.com

2. Link project:
```bash
supabase init
supabase link --project-ref your-project-ref
```

3. Deploy database and functions:

```bash
# Apply DB migrations
supabase db push

# Or you can use this command if you need to nuke the DB and reset it.
# supabase db reset --linked

# Deploy edge functions
supabase functions deploy create-task-with-ai
supabase functions deploy create-stripe-session
supabase functions deploy stripe-webhook
```

4. Disable `Enforce JWT Verification` ( **Edge Functions > stripe-webhook > Details > Enforce JWT Verification**) for your Stripe webhook Edge Function.

5. Disable email confirmation in Supabase Dashboard:
   - Authentication > Providers > Email
   - Uncheck "Confirm email"

### OpenAI Setup

1. Get API key from platform.openai.com
2. Set as Supabase secret:

```bash
supabase secrets set OPENAI_API_KEY=your-key
```

### Stripe Setup

1. Create Stripe test account and get API keys

2. Create subscription product:

```bash
stripe prices create \
  --currency=usd \
  --unit-amount=1000 \
  -d "recurring[interval]"=month \
  -d "recurring[trial_period_days]"=14 \
  -d "product_data[name]"="TaskMaster Premium"
```

3. Configure customer portal:

```bash
stripe billing_portal configurations create \
  -d "business_profile[privacy_policy_url]=https://your-site.com/privacy" \
  -d "business_profile[terms_of_service_url]=https://your-site.com/terms" \
  -d "default_return_url=http://localhost:3000/profile" \
  -d "features[subscription_cancel][enabled]=true" \
  -d "features[payment_method_update][enabled]=true"
```

4. Set up webhook in Stripe Dashboard:
   - Endpoint: `https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`

5. Set up Stripe secret in Supabase PostgresSQL vault. Go into your Supabase dashboard, to go **SQL Editor** then run this command (replacing your secret key):

```sql
insert into vault.secrets (name, secret)
select 'stripe', 'sk_test_xxx'
returning key_id;
```

### Required Environment Variables

`.env.example` and `.env.test.example` explain each variable and where to find its value.

```bash
# .env.local (to run the app) and .env.test.local (for the tests) both need these:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # publishable key

# Only .env.test.local needs these (they are secret: never put them in .env.local):
SUPABASE_SECRET_KEY=sb_secret_...                  # secret key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Set Supabase Secrets

Your Edge Functions will also need those environment variables. Set them like this:

```bash
supabase secrets set OPENAI_API_KEY="sk-xxx..."
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PRICE_ID=price_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/integration/2_auth.test.ts

# Run specific test case
npm test tests/integration/5_task_limits.test.ts -- -t "free user cannot exceed task limit"
```

### Testing Locally

Start development server and go to the local site for testing.

```bash
npm run dev
```

## Project Structure

```text
taskapp/
├── app/               # Next.js pages and layouts
├── components/        # React components
├── hooks/             # Application logic
│   ├── useAuth.ts     # Authentication
│   ├── useTask.ts     # Task management
│   └── useUser.ts     # User profile/subscription
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Database migrations
└── tests/
    └── integration/   # Integration tests
```
