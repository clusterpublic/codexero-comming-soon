// Test Telegram Bot Connection
// Run this in browser console or Node.js to test your bot

const BOT_TOKEN = '8433883210:AAHrE_KfXSWItyMt0zCoQVM_r6BKJxstkPY';
const CHANNEL_USERNAME = '@codexero_testing_1';

// Test bot connection
async function testBotConnection() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Bot connection successful:', data.result);
      return data.result;
    } else {
      console.error('❌ Bot connection failed:', data.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing bot connection:', error);
    return null;
  }
}

// Test channel info
async function testChannelInfo() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHANNEL_USERNAME}`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Channel info retrieved:', data.result);
      return data.result;
    } else {
      console.error('❌ Failed to get channel info:', data.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting channel info:', error);
    return null;
  }
}

// Test membership check (you'll need a real user ID)
async function testMembershipCheck(userId) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${userId}`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Membership check successful:', data.result);
      return data.result;
    } else {
      console.error('❌ Failed to check membership:', data.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking membership:', error);
    return null;
  }
}

// Run tests
console.log('🧪 Testing Telegram Bot Connection...');
console.log('Bot Token:', BOT_TOKEN);
console.log('Channel:', CHANNEL_USERNAME);

// Test bot connection
testBotConnection().then(bot => {
  if (bot) {
    console.log('🎉 Bot is working!');
    
    // Test channel info
    testChannelInfo().then(channel => {
      if (channel) {
        console.log('🎉 Channel info retrieved successfully!');
        console.log('Channel Title:', channel.title);
        console.log('Channel Username:', channel.username);
        console.log('Member Count:', channel.member_count);
      }
    });
  }
});

// Export functions for manual testing
window.testTelegramBot = {
  testBotConnection,
  testChannelInfo,
  testMembershipCheck
};
