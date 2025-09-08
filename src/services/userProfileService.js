import { supabase } from '../supabase';

// User Profile Service - handles all user profile operations
export class UserProfileService {
  
  // Get user profile by wallet address
  static async getProfileByWallet(walletAddress) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting profile by wallet:', error);
      return null;
    }
  }

  // Get user profile by user ID
  static async getProfileByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting profile by user ID:', error);
      return null;
    }
  }

  // Update Twitter connection information
  static async updateTwitterConnection(userId, twitterData) {
    try {
      console.log('updateTwitterConnection called with:', { userId, twitterData });
      
      // First, check if user profile exists
      let profile = await this.getProfileByUserId(userId);
      console.log('Existing profile check result:', profile);
      
      if (!profile) {
        console.log('No user profile found, creating new profile for Twitter connection...');
        
        // Create a new profile with Twitter data
        const profileData = {
          user_id: userId,
          wallet_address: null, // Will be set when wallet connects
          twitter_user_id: twitterData.user_id,
          twitter_username: twitterData.username,
          twitter_display_name: twitterData.display_name || twitterData.name,
          twitter_profile_image: twitterData.profile_image_url,
          twitter_connected: true,
          twitter_connected_at: new Date().toISOString(),
          verification_metadata: {
            profile_created_via: 'twitter_oauth',
            twitter_connection: {
              provider: twitterData.provider,
              timestamp: new Date().toISOString(),
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Attempting to create profile with data:', profileData);
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        
        profile = newProfile;
        console.log('New user profile created for Twitter connection:', profile.id);
      } else {
        console.log('Updating existing user profile with Twitter connection...');
        
        // Update existing profile
        const updateData = {
          twitter_user_id: twitterData.user_id,
          twitter_username: twitterData.username,
          twitter_display_name: twitterData.display_name || twitterData.name,
          twitter_profile_image: twitterData.profile_image_url,
          twitter_connected: true,
          twitter_connected_at: new Date().toISOString(),
          verification_metadata: {
            ...profile.verification_metadata,
            twitter_connection: {
              provider: twitterData.provider,
              timestamp: new Date().toISOString(),
            },
          },
          updated_at: new Date().toISOString()
        };
        
        console.log('Attempting to update profile with data:', updateData);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
        profile = data;
      }

      // Note: Special name checking is now only done when user explicitly verifies display name
      // This prevents automatic verification on Twitter connection

      console.log('Final profile result:', profile);
      return profile;
    } catch (error) {
      console.error('Error updating Twitter connection:', error);
      return null;
    }
  }

  // Disconnect Twitter and reset all Twitter-related verifications
  static async disconnectTwitter(userId) {
    try {
      // First get the current profile to merge metadata
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          // Reset Twitter connection info
          twitter_user_id: null,
          twitter_username: null,
          twitter_display_name: null,
          twitter_profile_image: null,
          twitter_connected: false,
          twitter_connected_at: null,
          
          // Reset Twitter-related verifications
          twitter_followed_cluster: false,
          twitter_followed_at: null,
          twitter_posted_about_cluster: false,
          twitter_posted_at: null,
          twitter_post_url: null,
          
          // Reset ALL verification fields that depend on Twitter connection
          custom_username_checked: false,
          custom_username: null,
          custom_username_verified_at: null,
          special_name_exists: false,
          special_name: null,
          telegram_joined: false,
          telegram_joined_at: null,
          
          // Reset overall completion status (will be recalculated by trigger)
          all_steps_completed: false,
          completed_at: null,
          
          // Add disconnect metadata while preserving existing metadata
          verification_metadata: {
            ...currentProfile.verification_metadata,
            twitter_disconnected_at: new Date().toISOString(),
            disconnect_reason: 'user_requested',
            verifications_reset: {
              custom_username: false,
              special_name: false,
              telegram_joined: false,
              reset_at: new Date().toISOString()
            }
          },
          
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('Twitter disconnected successfully - all verification fields reset');
      return data;
    } catch (error) {
      console.error('Error disconnecting Twitter:', error);
      return null;
    }
  }

  // Complete Twitter disconnect (includes Supabase auth logout)
  static async completeTwitterDisconnect(userId) {
    try {
      // First disconnect from our user profile
      const profileResult = await this.disconnectTwitter(userId);
      
      // Then logout from Supabase auth to clear the Twitter session
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Error signing out from Supabase:', signOutError);
        // Continue even if sign out fails - profile is already disconnected
      }
      
      console.log('Complete Twitter disconnect successful');
      return profileResult;
    } catch (error) {
      console.error('Error in complete Twitter disconnect:', error);
      return null;
    }
  }

  // Update Twitter follow status
  static async updateTwitterFollow(userId, metadata = {}) {
    try {
      // First get the current profile to merge metadata
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          twitter_followed_cluster: true,
          twitter_followed_at: new Date().toISOString(),
          verification_metadata: {
            ...currentProfile.verification_metadata,
            follow_verification: metadata
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating Twitter follow:', error);
      return null;
    }
  }

  // Update Twitter post status
  static async updateTwitterPost(userId, postUrl = null, metadata = {}) {
    try {
      // First get the current profile to merge metadata
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          twitter_posted_about_cluster: true,
          twitter_posted_at: new Date().toISOString(),
          twitter_post_url: postUrl,
          verification_metadata: {
            ...currentProfile.verification_metadata,
            post_verification: metadata
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating Twitter post:', error);
      return null;
    }
  }

  // Update custom username verification
  static async updateCustomUsername(userId, customUsername, metadata = {}) {
    try {
      // First get the current profile to merge metadata
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          custom_username_checked: true,
          custom_username: customUsername,
          custom_username_verified_at: new Date().toISOString(),
          verification_metadata: {
            ...currentProfile.verification_metadata,
            username_verification: metadata
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Note: Special name checking is now only done when explicitly verifying display name
      // This prevents automatic verification on custom username updates

      return data;
    } catch (error) {
      console.error('Error updating custom username:', error);
      return null;
    }
  }

  // Update Telegram join status
  static async updateTelegramJoin(userId, metadata = {}) {
    try {
      // First get the current profile to merge metadata
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          telegram_joined: true,
          telegram_joined_at: new Date().toISOString(),
          verification_metadata: {
            ...currentProfile.verification_metadata,
            telegram_verification: metadata
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating Telegram join:', error);
      return null;
    }
  }

  // Check and update special name (content in parentheses)
  static async checkAndUpdateSpecialName(profileId, displayName) {
    try {
      // Extract text between parentheses using regex
      const specialNameMatch = displayName.match(/\(([^)]+)\)/);
      
      if (specialNameMatch && specialNameMatch[1]) {
        const specialName = specialNameMatch[1].trim();
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            special_name_exists: true,
            special_name: specialName,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId)
          .select()
          .single();

        if (error) throw error;
        
        console.log('Special name detected and saved:', specialName);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking special name:', error);
      return null;
    }
  }

  // Get verification progress
  static async getVerificationProgress(userId) {
    try {
      const profile = await this.getProfileByUserId(userId);
      
      if (!profile) return null;

      const steps = {
        wallet_connected: !!profile.wallet_address,
        twitter_connected: profile.twitter_connected,
        twitter_followed: profile.twitter_followed_cluster,
        twitter_posted: profile.twitter_posted_about_cluster,
        username_checked: profile.custom_username_checked,
        telegram_joined: profile.telegram_joined
      };

      const completedSteps = Object.values(steps).filter(Boolean).length;
      const totalSteps = Object.keys(steps).length;
      const progressPercentage = (completedSteps / totalSteps) * 100;

      return {
        steps,
        completedSteps,
        totalSteps,
        progressPercentage,
        allCompleted: profile.all_steps_completed,
        completedAt: profile.completed_at
      };
    } catch (error) {
      console.error('Error getting verification progress:', error);
      return null;
    }
  }

  // Create or update profile with wallet connection
  static async createOrUpdateProfile(walletAddress, userId, additionalData = {}) {
    try {
      const existingProfile = await this.getProfileByWallet(walletAddress);
      
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            wallet_connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...additionalData
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            wallet_address: walletAddress.toLowerCase(),
            wallet_connected_at: new Date().toISOString(),
            verification_metadata: {
              created_via: 'wallet_connection',
              user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
              ...additionalData
            }
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      return null;
    }
  }
}
