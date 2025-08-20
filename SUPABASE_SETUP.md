# Supabase Setup for CodeXero Waitlist

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `codexero-waitlist` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. In your project dashboard, go to Settings → API
2. Copy the following values:
   - Project URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - Anon public key (starts with `eyJ...`)

## 3. Set Up Environment Variables

1. Create a `.env` file in your project root:
```bash
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

2. Replace the placeholder values with your actual credentials

## 4. Set Up the Database

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-setup.sql`
3. Click "Run" to execute the SQL script

This will create:
- `waitlist_subscriptions` table
- Proper indexes for performance
- Row Level Security policies
- Analytics view for insights

## 5. Test the Integration

1. Start your React app: `npm start`
2. Open the waitlist modal
3. Submit an email address
4. Check your Supabase dashboard → Table Editor → `waitlist_subscriptions` to see the data

## 6. Monitor Subscriptions

In your Supabase dashboard, you can:
- View all subscriptions in the Table Editor
- Use the `waitlist_analytics` view for insights
- Set up real-time subscriptions
- Export data for analysis

## 7. Security Features

The setup includes:
- Row Level Security (RLS) enabled
- Public insert policy for signups
- Unique email constraints
- Automatic timestamp updates

## 8. Next Steps

Consider adding:
- Email validation
- Rate limiting
- Admin dashboard
- Email notifications
- Analytics dashboard

## Troubleshooting

- **"Invalid API key"**: Check your environment variables
- **"Table doesn't exist"**: Run the SQL setup script
- **"RLS policy violation"**: Check the policies in the SQL script
- **"Network error"**: Verify your Supabase URL is correct
