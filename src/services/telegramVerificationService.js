class TelegramVerificationService {
  constructor() {
    this.botToken = '8433883210:AAHrE_KfXSWItyMt0zCoQVM_r6BKJxstkPY';
    this.channelUsername = '@codexero_testing_1';
    this.botUsername = '@codexero_verify_bot';
    this.baseUrl = 'https://api.telegram.org/bot';
  }

  // Generate unique verification code
  generateVerificationCode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CX${timestamp.slice(-4)}${random.toUpperCase()}`;
  }

  // Check if user is member of the channel
  async checkChannelMembership(userId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.botToken}/getChatMember?chat_id=${this.channelUsername}&user_id=${userId}`
      );
      
      const data = await response.json();
      
      if (data.ok) {
        const status = data.result.status;
        // status can be: 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
        return {
          isMember: ['creator', 'administrator', 'member'].includes(status),
          status: status,
          user: data.result.user
        };
      } else {
        throw new Error(`Failed to check membership: ${data.description}`);
      }
    } catch (error) {
      console.error('Error checking channel membership:', error);
      return { isMember: false, error: error.message };
    }
  }

  // Get channel info
  async getChannelInfo() {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.botToken}/getChat?chat_id=${this.channelUsername}`
      );
      
      const data = await response.json();
      
      if (data.ok) {
        return {
          title: data.result.title,
          username: data.result.username,
          memberCount: data.result.member_count,
          description: data.result.description
        };
      } else {
        throw new Error(`Failed to get channel info: ${data.description}`);
      }
    } catch (error) {
      console.error('Error getting channel info:', error);
      return null;
    }
  }

  // Test bot connection
  async testBotConnection() {
    try {
      const response = await fetch(`${this.baseUrl}${this.botToken}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        return {
          success: true,
          bot: data.result
        };
      } else {
        throw new Error(`Bot test failed: ${data.description}`);
      }
    } catch (error) {
      console.error('Bot connection test error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default TelegramVerificationService;
