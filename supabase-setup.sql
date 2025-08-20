-- Create the waitlist_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS waitlist_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add walletAddress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waitlist_subscriptions' 
        AND column_name = 'walletAddress'
    ) THEN
        ALTER TABLE waitlist_subscriptions ADD COLUMN walletAddress VARCHAR(255);
    END IF;
END $$;

-- Add unique constraint to walletAddress if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'waitlist_subscriptions_walletAddress_key'
    ) THEN
        ALTER TABLE waitlist_subscriptions ADD CONSTRAINT waitlist_subscriptions_walletAddress_key UNIQUE (walletAddress);
    END IF;
END $$;

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_subscriptions_email ON waitlist_subscriptions(email);

-- Create an index on walletAddress for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_subscriptions_wallet ON waitlist_subscriptions(walletAddress);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_waitlist_subscriptions_status ON waitlist_subscriptions(status);

-- Create an index on subscribed_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_waitlist_subscriptions_date ON waitlist_subscriptions(subscribed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON waitlist_subscriptions;
DROP POLICY IF EXISTS "Allow users to view own subscription" ON waitlist_subscriptions;

-- Create a policy that allows anyone to insert (for signups)
CREATE POLICY "Allow public insert" ON waitlist_subscriptions
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows users to view their own subscriptions
CREATE POLICY "Allow users to view own subscription" ON waitlist_subscriptions
  FOR SELECT USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_waitlist_subscriptions_updated_at ON waitlist_subscriptions;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_waitlist_subscriptions_updated_at 
  BEFORE UPDATE ON waitlist_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Drop existing view if it exists
DROP VIEW IF EXISTS waitlist_analytics;

-- Optional: Create a view for analytics
CREATE OR REPLACE VIEW waitlist_analytics AS
SELECT 
  DATE(subscribed_at) as signup_date,
  COUNT(*) as daily_signups,
  SUM(COUNT(*)) OVER (ORDER BY DATE(subscribed_at)) as cumulative_signups
FROM waitlist_subscriptions 
WHERE status = 'active'
GROUP BY DATE(subscribed_at)
ORDER BY signup_date;
