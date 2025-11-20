# updated.email

A personalized newsletter service that keeps you up-to-date with the latest releases from your favorite npm packages. Subscribe to the packages you actually use and receive weekly summaries of their updates.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Backend**: [Convex](https://www.convex.dev/) (database & serverless functions)
- **Email**: [Resend](https://resend.com/) for transactional emails
- **Email Templates**: [React Email](https://react.email/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Type Safety**: TypeScript with [Zod](https://zod.dev/)
- **Linting**: [Biome](https://biomejs.dev/)
- **Deployment**: [Vercel](https://vercel.com/) with cron jobs

## Getting Started

### Prerequisites

- Bun
- A [Convex](https://www.convex.dev/) account
- A [Resend](https://resend.com/) account
- (Optional) A GitHub token for changelog fetching

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd updated.email
```

2. Install dependencies:

```bash
bun install
```

3. Set up Convex:

```bash
bunx convex dev
```

This will:

- Create a new Convex project (if needed)
- Generate the Convex client configuration
- Start the Convex development server

4. Set up environment variables:

```bash
cp env.sample .env.local
# or
vercel env pull .env.local
```

5. Run the development server:

```bash
bun dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Email Development

Preview email templates locally using React Email:

```bash
bun email:dev
```

This starts a preview server where you can view and test all email templates.

### Database Schema

The application uses Convex for data storage. Key tables include:

- `subscriptions` - User newsletter subscriptions
- `package_subscriptions` - User package preferences
- `verification_tokens` - Email verification tokens
- `login_tokens` - Magic link authentication tokens
- `unsubscribe_tokens` - Unsubscribe tokens
- `sessions` - User sessions
- `newsletter_sends` - Newsletter send tracking

See `convex/schema.ts` for the complete schema definition.

## How It Works

1. **Subscription**: Users enter their email and receive a verification email
2. **Verification**: Users click the verification link to confirm their subscription
3. **Package Selection**: Users can sign in via magic link to select npm packages to follow
4. **Weekly Newsletter**: Every Sunday, the cron job:
   - Fetches all active subscribers
   - Gets their subscribed packages
   - Checks npm registry for updates published in the last week
   - Generates personalized newsletters
   - Sends emails via Resend
5. **Management**: Users can manage subscriptions, add/remove packages, and unsubscribe via the dashboard
