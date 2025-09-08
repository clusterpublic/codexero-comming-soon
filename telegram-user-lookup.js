// ES Module version - no require() needed
const BOT_TOKEN = '8433883210:AAHrE_KfXSWItyMt0zCoQVM_r6BKJxstkPY';

async function getTelegramUserID(username) {
  try {
    console.log(`🔍 Looking up Telegram user ID for username: ${username}`);
    
    // Remove @ if present
    const cleanUsername = username.replace('@', '');
    
    // Method 1: Use Telegram API directly (no external dependencies)
    console.log('🔄 Trying Method 1: Direct API call...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${cleanUsername}`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Method 1 (Direct API) - Success!');
      console.log('📱 User Info:', {
        id: data.result.id,
        username: data.result.username,
        firstName: data.result.first_name,
        lastName: data.result.last_name,
        type: data.result.type
      });
      return data.result.id;
    } else {
      console.log('❌ Method 1 failed:', data.description);
    }
    
    // Method 2: Try alternative approach with different chat_id format
    console.log('🔄 Trying Method 2: Alternative format...');
    
    try {
      const response2 = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${cleanUsername}`);
      const data2 = await response2.json();
      
      if (data2.ok) {
        console.log('✅ Method 2 - Success!');
        console.log('📱 User Info:', {
          id: data2.result.id,
          username: data2.result.username,
          firstName: data2.result.first_name,
          lastName: data2.result.last_name,
          type: data2.result.type
        });
        return data2.result.id;
      } else {
        console.log('❌ Method 2 failed:', data2.description);
      }
    } catch (error) {
      console.log('❌ Method 2 error:', error.message);
    }
    
    // Method 3: Try to get bot info to verify token works
    console.log('🔄 Trying Method 3: Verify bot token...');
    
    try {
      const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const botData = await botResponse.json();
      
      if (botData.ok) {
        console.log('✅ Bot token is valid:', botData.result);
        console.log('💡 Bot info:', {
          id: botData.result.id,
          name: botData.result.first_name,
          username: botData.result.username
        });
      } else {
        console.log('❌ Bot token issue:', botData.description);
      }
    } catch (error) {
      console.log('❌ Bot verification error:', error.message);
    }
    
    return null;
    
  } catch (error) {
    console.error('💥 Error getting Telegram user ID:', error.message);
    return null;
  }
}

// Test the function
async function test() {
  const usernames = ['@Narayan160320', 'Narayan160320','@Narayan1603', 'elonmusk', '@elonmusk'];
  
  for (const username of usernames) {
    console.log('\n' + '='.repeat(50));
    console.log(`🧪 Testing username: ${username}`);
    console.log('='.repeat(50));
    
    const userId = await getTelegramUserID(username);
    
    if (userId) {
      console.log(`🎉 SUCCESS: ${username} → User ID: ${userId}`);
    } else {
      console.log(`❌ FAILED: Could not get user ID for ${username}`);
    }
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the test
test().catch(console.error);