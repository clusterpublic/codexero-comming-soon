# 🔌 Twitter Disconnect Guide

## 📋 **How to Disconnect Twitter**

### **Option 1: Using the Disconnect Button (Recommended)**

1. **Go to Verification Page**
   - Navigate to `/mint-nft` in your app
   - Go to Step 1: Social Verification

2. **Find Twitter Connection Section**
   - Look for the "Connect Twitter" verification item
   - If Twitter is connected, you'll see a green "✓ Completed" button

3. **Click Disconnect Button**
   - Next to the completed button, you'll see a red "Disconnect" button
   - Click the "Disconnect" button

4. **Confirm Disconnection**
   - A confirmation dialog will appear explaining what will happen:
     ```
     Are you sure you want to disconnect Twitter? This will:
     
     • Remove your Twitter connection
     • Reset all Twitter-related verifications (follow, post)
     • Sign you out of the current session
     • You'll need to reconnect and redo verifications
     
     Continue with disconnect?
     ```
   - Click "OK" to confirm or "Cancel" to abort

5. **Automatic Reset**
   - Your profile will be updated to remove Twitter connection
   - All Twitter verifications will be reset to false
   - You'll be signed out automatically
   - The page will refresh

### **Option 2: Manual Database Reset (Admin)**

If you have database access, you can manually reset a user's Twitter connection:

```sql
-- Reset specific user's Twitter connection
UPDATE user_profiles 
SET 
  twitter_user_id = NULL,
  twitter_username = NULL,
  twitter_display_name = NULL,
  twitter_profile_image = NULL,
  twitter_connected = FALSE,
  twitter_connected_at = NULL,
  twitter_followed_cluster = FALSE,
  twitter_followed_at = NULL,
  twitter_posted_about_cluster = FALSE,
  twitter_posted_at = NULL,
  twitter_post_url = NULL,
  all_steps_completed = FALSE,
  completed_at = NULL,
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';
```

## 🔄 **What Happens When You Disconnect**

### **Immediate Effects:**
1. **Profile Reset:**
   - `twitter_connected = false`
   - `twitter_user_id = null`
   - `twitter_username = null`
   - `twitter_display_name = null`
   - `twitter_profile_image = null`

2. **Verification Reset:**
   - `twitter_followed_cluster = false`
   - `twitter_posted_about_cluster = false`
   - `all_steps_completed = false`

3. **Session Logout:**
   - Supabase auth session cleared
   - User signed out completely
   - Page refreshes automatically

### **Preserved Data:**
- ✅ Wallet connection remains
- ✅ Custom username verification (if completed)
- ✅ Telegram join verification (if completed)
- ✅ Profile creation timestamp
- ✅ Disconnect metadata added to `verification_metadata`

## 🔐 **Security & Privacy**

### **Data Removal:**
- **Removed**: Twitter user ID, username, display name, profile image
- **Removed**: All Twitter verification timestamps and URLs
- **Removed**: Twitter OAuth session from Supabase
- **Preserved**: Wallet address, non-Twitter verifications

### **Metadata Tracking:**
The system adds disconnect metadata:
```json
{
  "twitter_disconnected_at": "2025-01-01T12:00:00.000Z",
  "disconnect_reason": "user_requested"
}
```

## 🔄 **Reconnecting After Disconnect**

### **To Reconnect:**
1. **Go to Verification Page**
   - Navigate back to `/mint-nft`
   - Go to Step 1: Social Verification

2. **Connect Twitter Again**
   - Click "Connect Twitter" button
   - Complete OAuth flow with Twitter
   - Your Twitter info will be saved again

3. **Redo Verifications**
   - Follow @ClusterProtocol again
   - Post about ClusterProtocol again
   - All previous verifications need to be redone

### **Fresh Start:**
- New `twitter_connected_at` timestamp
- New Twitter user data (in case it changed)
- Fresh verification process
- New completion tracking

## ⚠️ **Important Notes**

### **Before Disconnecting:**
- ⚠️ **All Twitter verifications will be lost** (follow, post)
- ⚠️ **You'll need to redo all Twitter-related steps**
- ⚠️ **You'll be signed out immediately**
- ⚠️ **Cannot be undone** (you'll need to reconnect manually)

### **When to Disconnect:**
- ✅ Want to connect a different Twitter account
- ✅ Privacy concerns about Twitter data
- ✅ Troubleshooting authentication issues
- ✅ Starting verification process fresh

### **Alternatives to Consider:**
- **Partial Reset**: Contact support for specific verification resets
- **Account Switch**: Use different browser/incognito for different account
- **Support**: Contact support for assistance instead of full disconnect

## 🛠️ **Troubleshooting**

### **Disconnect Button Not Showing:**
- Ensure Twitter is actually connected (green checkmark)
- Refresh the page and check again
- Check console for JavaScript errors

### **Disconnect Fails:**
- Check internet connection
- Try refreshing and attempting again
- Check browser console for errors
- Contact support if issue persists

### **Stuck After Disconnect:**
- Clear browser cache and cookies
- Try accessing the page in incognito mode
- Manually navigate to homepage and try again

## 📞 **Support**

If you encounter issues with Twitter disconnection:
- **Check Console**: Look for error messages in browser console
- **Try Again**: Most issues are temporary - try again after a few minutes
- **Contact Support**: Provide your wallet address and description of the issue

The disconnect feature is designed to be safe and complete - it ensures all Twitter-related data is properly removed while preserving your other verification progress! 🔒
