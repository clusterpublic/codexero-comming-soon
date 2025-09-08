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

  // Check if user is member of the channel using username
  async checkChannelMembership(username) {
    try {
      // Remove @ if present and ensure proper format
      const cleanUsername = username.replace('@', '');
      
      console.log('🔍 Checking membership for username:', cleanUsername);
      
      const response = await fetch(
        `${this.baseUrl}${this.botToken}/getChatMember?chat_id=${this.channelUsername}&user_name=@${cleanUsername}`
      );
      
      const data = await response.json();
      console.log('📡 Telegram API response:', data);
      
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

  // Verify user membership with retry logic
  async verifyMembershipWithRetry(userId, maxAttempts = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const membership = await this.checkChannelMembership(userId);
        
        if (membership.isMember) {
          return { ...membership, attempt, verified: true };
        }
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
    
    return { isMember: false, verified: false, attempts: maxAttempts };
  }

  // Get user's Telegram profile info
  async getUserProfile(userId) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.botToken}/getChatMember?chat_id=${this.channelUsername}&user_id=${userId}`
      );
      
      const data = await response.json();
      
      if (data.ok && data.result.user) {
        return {
          id: data.result.user.id,
          username: data.result.user.username,
          firstName: data.result.user.first_name,
          lastName: data.result.user.last_name,
          isBot: data.result.user.is_bot
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Send verification message to user via bot
  async sendVerificationMessage(userId, message) {
    try {
      const response = await fetch(
        `${this.baseUrl}${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: userId,
            text: message,
            parse_mode: 'HTML'
          })
        }
      );
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}

export default TelegramVerificationService;
