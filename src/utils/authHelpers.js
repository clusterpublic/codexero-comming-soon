import { supabase } from '../supabase';

// Auth helper functions
export class AuthHelpers {
  
  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('User signed out successfully');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  // Check if user is connected via specific provider
  static isConnectedViaProvider(user, provider) {
    return user?.app_metadata?.provider === provider;
  }

  // Check if user has Twitter data
  static hasTwitterData(user) {
    return !!(
      user?.user_metadata?.twitter_username || 
      user?.user_metadata?.user_name ||
      user?.user_metadata?.preferred_username ||
      user?.user_metadata?.full_name
    );
  }

  // Get Twitter username from user metadata
  static getTwitterUsername(user) {
    return user?.user_metadata?.twitter_username || 
           user?.user_metadata?.user_name ||
           user?.user_metadata?.preferred_username ||
           'unknown';
  }

  // Get display name from user metadata
  static getDisplayName(user) {
    return user?.user_metadata?.full_name || 
           user?.user_metadata?.name ||
           user?.user_metadata?.display_name ||
           this.getTwitterUsername(user);
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      callback(event, session);
    });

    return subscription;
  }

  // Clean up auth listener
  static removeAuthListener(subscription) {
    if (subscription) {
      subscription.unsubscribe();
    }
  }
}
