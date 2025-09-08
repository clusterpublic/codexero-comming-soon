# 🚀 User Profile System Setup Guide

## 📊 **Complete User Profile Flow**

This system creates a comprehensive user profile that tracks all verification steps from wallet connection to completion.

### **Flow Overview:**
1. **Wallet Connection** (Wagmi) → Creates `user_profiles` row
2. **Twitter Connection** (Supabase OAuth) → Updates profile with Twitter info
3. **Follow ClusterProtocol** → Updates `twitter_followed_cluster` field
4. **Post about ClusterProtocol** → Updates `twitter_posted_about_cluster` field
5. **Username Check** → Updates `custom_username_checked` + special name detection
6. **Telegram Join** → Updates `telegram_joined` field
7. **Auto-completion** → Sets `all_steps_completed = true`

## 🗄️ **Database Setup**

### **Step 1: Create User Profiles Table**
Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste contents from: supabase-user-profiles.sql
```

### **Table Structure:**
```sql
user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID → auth.users(id),
    
    -- Wallet Info
    wallet_address TEXT UNIQUE,
    wallet_connected_at TIMESTAMP,
    
    -- Twitter Info
    twitter_user_id TEXT,
    twitter_username TEXT,
    twitter_display_name TEXT,
    twitter_profile_image TEXT,
    twitter_connected BOOLEAN,
    twitter_connected_at TIMESTAMP,
    
    -- Verification Steps
    twitter_followed_cluster BOOLEAN,
    twitter_followed_at TIMESTAMP,
    twitter_posted_about_cluster BOOLEAN,
    twitter_posted_at TIMESTAMP,
    twitter_post_url TEXT,
    custom_username_checked BOOLEAN,
    custom_username TEXT,
    custom_username_verified_at TIMESTAMP,
    
    -- Special Name Detection
    special_name_exists BOOLEAN,
    special_name TEXT,
    
    telegram_joined BOOLEAN,
    telegram_joined_at TIMESTAMP,
    
    -- Overall Status
    all_steps_completed BOOLEAN,
    completed_at TIMESTAMP,
    verification_metadata JSONB
)
```

## 🔧 **Features Implemented**

### **1. Wallet Connection (Wagmi)**
- ✅ Creates user profile when wallet connects
- ✅ Links wallet address to Supabase auth user
- ✅ Stores connection metadata

### **2. Twitter Connection (Supabase OAuth)**
- ✅ Updates profile with Twitter user data
- ✅ Extracts username, display name, profile image
- ✅ Automatically detects special names in parentheses

### **3. Twitter Follow Verification**
- ✅ Updates `twitter_followed_cluster` field
- ✅ Stores follow timestamp
- ✅ Handles API fallbacks gracefully

### **4. Twitter Post Verification**
- ✅ Updates `twitter_posted_about_cluster` field
- ✅ Stores post timestamp and URL (if available)
- ✅ Searches for ClusterProtocol/CodeXero mentions

### **5. Custom Username Verification**
- ✅ Updates `custom_username_checked` field
- ✅ Stores the verified username
- ✅ **Special Name Detection**: Extracts content from parentheses
- ✅ Example: "John Doe (Special Name)" → saves "Special Name"

### **6. Telegram Join Verification**
- ✅ Updates `telegram_joined` field
- ✅ Manual confirmation process

### **7. Auto-Completion System**
- ✅ Automatically sets `all_steps_completed = true` when all steps done
- ✅ Records completion timestamp
- ✅ Database trigger handles this automatically

## 🎯 **Special Name Detection**

### **How it Works:**
```javascript
// Automatically extracts text in parentheses
"John Smith (Crypto Expert)" → "Crypto Expert"
"Alice (Web3 Dev)" → "Web3 Dev"
"Bob Johnson" → null (no special name)
```

### **Database Fields:**
- `special_name_exists`: Boolean flag
- `special_name`: Extracted text from parentheses

### **Triggers:**
- Twitter display name update
- Custom username verification

## 📱 **UserProfileService API**

### **Key Methods:**
```javascript
// Get profile by wallet or user ID
UserProfileService.getProfileByWallet(walletAddress)
UserProfileService.getProfileByUserId(userId)

// Update verification steps
UserProfileService.updateTwitterConnection(userId, twitterData)
UserProfileService.updateTwitterFollow(userId, metadata)
UserProfileService.updateTwitterPost(userId, postUrl, metadata)
UserProfileService.updateCustomUsername(userId, username, metadata)
UserProfileService.updateTelegramJoin(userId, metadata)

// Get verification progress
UserProfileService.getVerificationProgress(userId)
```

## 🔍 **Verification Progress Tracking**

### **Progress Object:**
```javascript
{
  steps: {
    wallet_connected: true,
    twitter_connected: true,
    twitter_followed: true,
    twitter_posted: false,
    username_checked: false,
    telegram_joined: false
  },
  completedSteps: 3,
  totalSteps: 6,
  progressPercentage: 50,
  allCompleted: false,
  completedAt: null
}
```

## 🚦 **Setup Instructions**

### **1. Database Setup**
```bash
# Run in Supabase SQL Editor
cat supabase-user-profiles.sql | pbcopy
# Paste and execute in Supabase
```

### **2. Test the Flow**
1. **Connect Wallet** → Check `user_profiles` table for new row
2. **Connect Twitter** → Verify Twitter fields populated
3. **Follow @ClusterProtocol** → Check `twitter_followed_cluster = true`
4. **Post about ClusterProtocol** → Check `twitter_posted_about_cluster = true`
5. **Check Username** → Verify `custom_username_checked = true`
6. **Join Telegram** → Check `telegram_joined = true`
7. **Auto-completion** → Verify `all_steps_completed = true`

### **3. Monitor Progress**
```sql
-- Check user profiles
SELECT * FROM user_profiles ORDER BY created_at DESC;

-- Check completion status
SELECT 
  wallet_address,
  twitter_username,
  all_steps_completed,
  completed_at,
  special_name_exists,
  special_name
FROM user_profiles;
```

## ✅ **System Benefits**

1. **Single Source of Truth**: All user data in one table
2. **Automatic Completion**: Database triggers handle status updates
3. **Special Name Detection**: Extracts meaningful info from usernames
4. **Progress Tracking**: Real-time verification progress
5. **Metadata Storage**: Flexible JSONB for additional info
6. **Audit Trail**: Timestamps for all verification steps
7. **Graceful Fallbacks**: Works even with API failures

The system now provides a complete user journey from wallet connection to verification completion! 🎉
