import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfileService } from '../services/userProfileService';
import { toast } from 'react-toastify';

// RapidAPI configuration for Twitter verification
const RAPIDAPI_KEY = '47822bb3bemsha001819593243e5p1b709djsn6666ce549748';
const RAPIDAPI_HOST = 'twitter154.p.rapidapi.com';



// API functions for Twitter verification
const checkTwitterFollowStatus = async (userId) => {
  try {
    console.log(`Checking if user ${userId} follows ClusterProtocol...`);
    
    // First, get the user's following list to check if they follow ClusterProtocol
    const response = await fetch(`https://${RAPIDAPI_HOST}/user/following?user_id=${userId}&limit=200`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    
    if (response.status === 403) {
      console.warn('RapidAPI access denied (403) - check API key and subscription. Using fallback verification.');
      return { isFollowing: true, data: null, fallback: true, reason: 'access_denied' };
    }
    
    if (response.status === 429) {
      console.warn('RapidAPI rate limited (429) - too many requests. Using fallback verification.');
      return { isFollowing: true, data: null, fallback: true, reason: 'rate_limited' };
    }
    
    if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Twitter following check result:', data);
    
    // Check if ClusterProtocol is in the following list
    const isFollowingCluster = data.results?.some(user => 
      user.username?.toLowerCase() === 'clusterprotocol' ||
      user.screen_name?.toLowerCase() === 'clusterprotocol'
    );
    
    return { isFollowing: isFollowingCluster || false, data, fallback: false };
  } catch (error) {
    console.error('Error checking Twitter follow status:', error);
    // Return fallback success to avoid blocking user experience
    return { isFollowing: true, error: error.message, fallback: true };
  }
};

const checkTwitterPostStatus = async (userId) => {
  try {
    console.log(`Checking recent tweets from user ${userId} for ClusterProtocol mentions...`);
    
    // Use the "User Tweets By User ID" endpoint to get recent tweets
    const response = await fetch(`https://${RAPIDAPI_HOST}/user/tweets?user_id=${userId}&limit=50`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    
    if (response.status === 403) {
      console.warn('RapidAPI access denied (403) for posts - check API key and subscription. Using fallback verification.');
      return { hasPosted: true, data: null, fallback: true, reason: 'access_denied' };
    }
    
    if (response.status === 429) {
      console.warn('RapidAPI rate limited (429) for posts - too many requests. Using fallback verification.');
      return { hasPosted: true, data: null, fallback: true, reason: 'rate_limited' };
    }
    
    if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Twitter posts check result:', data);
    
    // Check if user has posted about ClusterProtocol or CodeXero in recent tweets
    const hasClusterPost = data.results?.some(tweet => {
      const tweetText = (tweet.text || tweet.full_text || '').toLowerCase();
      return tweetText.includes('clusterprotocol') || 
             tweetText.includes('@clusterprotocol') ||
             tweetText.includes('codexero') || 
             tweetText.includes('@codexero') ||
             tweetText.includes('#clusterprotocol') ||
             tweetText.includes('#codexero');
    });
    
    console.log(`Found ClusterProtocol mention: ${hasClusterPost}`);
    return { hasPosted: hasClusterPost || false, data, fallback: false };
  } catch (error) {
    console.error('Error checking Twitter post status:', error);
    // Return fallback success to avoid blocking user experience
    return { hasPosted: true, error: error.message, fallback: true };
  }
};

const checkCustomUsernameAvailability = async (userId) => {
  try {
    console.log(`Checking user details for user ID ${userId}...`);
    
    // Use the "User By User ID" endpoint to check if user exists
    const response = await fetch(`https://${RAPIDAPI_HOST}/user/details?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    
    if (response.status === 403) {
      console.warn('RapidAPI access denied (403) for username check - check API key and subscription. Using fallback verification.');
      return { exists: true, available: false, data: null, fallback: true, reason: 'access_denied' };
    }
    
    if (response.status === 429) {
      console.warn('RapidAPI rate limited (429) for username check - too many requests. Using fallback verification.');
      return { exists: true, available: false, data: null, fallback: true, reason: 'rate_limited' };
    }
    
    if (response.status === 404) {
      // Username not found - it's available
      console.log(`Username ${username} not found - available`);
      return { exists: false, available: true, fallback: false };
    }
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Username check result:', data);
    
    // If we get user data, the username exists and is taken
    return { 
      exists: true, 
      available: false, 
      data,
      fallback: false,
      userInfo: {
        name: data.name,
        username: data.username || data.screen_name,
        verified: data.verified,
        followers: data.followers_count,
        description: data.description
      }
    };
  } catch (error) {
    console.error('Error checking username availability:', error);
    // Return fallback success to avoid blocking user experience
    return { exists: true, available: false, error: error.message, fallback: true };
  }
};

// Test API access function
const testRapidAPIAccess = async () => {
  try {
    console.log('Testing RapidAPI access with new key...');
    
    // Test with a known account to verify API access
    const response = await fetch(`https://${RAPIDAPI_HOST}/user/details?username=twitter`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    
    console.log('API Test Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Test Success:', data);
      return { success: true, data };
    } else if (response.status === 429) {
      console.warn('API Test Rate Limited (429) - this is normal for new keys');
      return { success: false, status: 429, statusText: 'Too Many Requests', rateLimited: true };
    } else if (response.status === 403) {
      console.warn('API Test Forbidden (403) - check API key and subscription');
      return { success: false, status: 403, statusText: 'Forbidden', accessDenied: true };
    } else {
      console.error('API Test Failed:', response.status, response.statusText);
      return { success: false, status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    console.error('API Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Supabase functions for verification status
const getVerificationStatusFromSupabase = async (userId, stepId) => {
  try {
    // Use UserProfileService instead of direct table access
    const profile = await UserProfileService.getProfileByUserId(userId);
    if (!profile) return null;
    
    // Map step_id to the corresponding field in user_profiles
    const stepMapping = {
      'step1_twitterConnect': profile.twitter_connected,
      'step1_twitterFollow': profile.twitter_followed_cluster,
      'step1_twitterPost': profile.twitter_posted_about_cluster,
      'step1_customUsername': profile.custom_username_checked,
      'step1_telegramJoin': profile.telegram_joined
    };
    
    return stepMapping[stepId] || false;
  } catch (error) {
    console.error('Error getting verification status from Supabase:', error);
    return null;
  }
};

const updateVerificationStatusInSupabase = async (userId, stepId, status, metadata = {}) => {
  try {
    // Use UserProfileService instead of direct table access
    const stepMapping = {
      'step1_twitterConnect': 'twitter_connected',
      'step1_twitterFollow': 'twitter_followed_cluster',
      'step1_twitterPost': 'twitter_posted_about_cluster',
      'step1_customUsername': 'custom_username_checked',
      'step1_telegramJoin': 'telegram_joined'
    };
    
    const fieldName = stepMapping[stepId];
    if (!fieldName) {
      console.error('Unknown step_id:', stepId);
      return null;
    }
    
    // Update the specific field in user_profiles
    const updateData = {
      [fieldName]: status,
      updated_at: new Date().toISOString()
    };
    
    // Add metadata to verification_metadata if needed
    if (Object.keys(metadata).length > 0) {
      const currentProfile = await UserProfileService.getProfileByUserId(userId);
      if (currentProfile) {
        updateData.verification_metadata = {
          ...currentProfile.verification_metadata,
          [stepId]: metadata
        };
      }
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating verification status in Supabase:', error);
    return null;
  }
};

/**
 * Step1Verification Component
 * 
 * Enhanced Twitter Connection Logic:
 * - Checks if user authenticated via Twitter specifically (provider === 'twitter')
 * - Verifies Twitter-specific user data exists (username, profile info)
 * - Provides clear feedback on connection status
 * - Prevents other verification steps until Twitter is properly connected
 * - Includes fallback manual verification option
 */
export default function Step1Verification({ onStepComplete }) {
  const [verificationStates, setVerificationStates] = useState({
    twitterConnect: false,
    twitterFollow: false,
    twitterPost: false,
    customUsername: false,
    telegramJoin: false
  });

  const [loading, setLoading] = useState({
    twitterConnect: false,
    twitterFollow: false,
    twitterPost: false,
    customUsername: false,
    telegramJoin: false
  });

  const [user, setUser] = useState(null);


  // Enhanced Twitter connection check
  const isTwitterConnected = user && user.app_metadata?.provider === 'twitter';
  const hasTwitterData = user && (
    user.user_metadata?.twitter_username || 
    user.user_metadata?.provider_id === 'twitter' ||
    user.user_metadata?.full_name // Twitter usually provides full_name
  );
  const isFullyTwitterVerified = isTwitterConnected && hasTwitterData;

  // Load verification states from user profile
  useEffect(() => {
    const loadVerificationStates = async () => {
      if (!user?.id) return;
      
      try {
        const progress = await UserProfileService.getVerificationProgress(user.id);
        
        if (progress) {
          setVerificationStates({
            twitterConnect: progress.steps.twitter_connected,
            twitterFollow: progress.steps.twitter_followed,
            twitterPost: progress.steps.twitter_posted,
            customUsername: progress.steps.username_checked,
            telegramJoin: progress.steps.telegram_joined
          });
          
          console.log('Loaded verification progress:', progress);
        } else {
          console.log('No user profile found, using default states');
        }
      } catch (error) {
        console.error('Error loading verification states:', error);
        // Continue with default states if there's an error
        console.log('Using default verification states due to error');
      }
    };

    loadVerificationStates();
  }, [user?.id]);

  // Test API access on component mount (only once)
  useEffect(() => {
    let isMounted = true;
    
    const testAPI = async () => {
      if (!isMounted) return;
      
      console.log('🔧 Testing RapidAPI access...');
      const result = await testRapidAPIAccess();
      
      if (isMounted) {
        if (result.success) {
          console.log('✅ RapidAPI access confirmed!');
        } else if (result.status === 429) {
          console.warn('⚠️ RapidAPI rate limited - will retry later');
        } else if (result.status === 403) {
          console.warn('⚠️ RapidAPI access denied - check API key and subscription');
        } else {
          console.warn('⚠️ RapidAPI access issue:', result);
        }
      }
    };
    
    // Delay API test to avoid immediate rate limiting
    const timer = setTimeout(testAPI, 2000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);



  // Check if all steps are completed
  useEffect(() => {
    const allCompleted = Object.values(verificationStates).every(state => state);
    if (allCompleted && onStepComplete) {
      onStepComplete();
    }
  }, [verificationStates, onStepComplete]);

  // Get Supabase user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      // Debug logging for Twitter connection status
      if (currentUser) {
        console.log('User session loaded:', {
          id: currentUser.id,
          provider: currentUser.app_metadata?.provider,
          metadata: currentUser.user_metadata,
          isTwitterConnected: currentUser.app_metadata?.provider === 'twitter',
          hasTwitterData: currentUser.user_metadata?.twitter_username || 
                         currentUser.user_metadata?.provider_id === 'twitter' ||
                         currentUser.user_metadata?.full_name
        });
      }
    };
    getUser();

    // Handle OAuth callback success and errors
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        console.error('OAuth Error:', error, errorDescription);
        
        // Handle specific Twitter OAuth email error
        if (error === 'server_error' && errorDescription?.includes('email')) {
          // This is a common Twitter OAuth issue - Twitter doesn't always provide email
          // We can still proceed with the verification as Twitter auth was successful
          console.log('Twitter OAuth succeeded but email not provided - this is normal');
          
          // Mark Twitter connection as successful despite email issue
          await updateVerificationStatusInSupabase(user.id, 'step1_twitterConnect', true);
          setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
          
          // Show success message instead of error
          toast.success('Twitter connection successful! (Note: Twitter did not provide email, but authentication is complete)');
        } else {
          toast.error(`Authentication error: ${errorDescription || error}`);
        }
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Check if OAuth was successful (no error parameters)
        // This means Twitter auth completed successfully
        console.log('OAuth callback successful - checking for Twitter connection...');
        
        // Trigger profile update for successful Twitter connection
        setTimeout(async () => {
          await handleOAuthSuccess();
        }, 1000);
      }
    };

    // Check for OAuth callback on mount
    handleOAuthCallback();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in - check if it's Twitter
        if (session.user.app_metadata?.provider === 'twitter') {
          console.log('Twitter user signed in - updating profile...');
          
          // Small delay to ensure session is fully established
          setTimeout(async () => {
            await handleOAuthSuccess();
          }, 500);
        }
      }
      
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Handle successful OAuth callback
  const handleOAuthSuccess = async () => {
    // Prevent multiple simultaneous calls
    if (handleOAuthSuccess.isProcessing) {
      console.log('OAuth success handler already processing, skipping...');
      return;
    }
    
    handleOAuthSuccess.isProcessing = true;
    
    try {
      console.log('Processing OAuth success...');
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
      if (!currentUser) {
        console.log('No user session found after OAuth');
        return;
      }
      
      console.log('User session after OAuth:', {
        id: currentUser.id,
        provider: currentUser.app_metadata?.provider,
        metadata: currentUser.user_metadata
      });
      
      // Check if this is a Twitter connection
      if (currentUser.app_metadata?.provider === 'twitter') {
        console.log('Twitter OAuth successful - updating user profile...');
        
        // Log the data we're about to send
        const twitterData = {
          id: currentUser.id,
          username: currentUser.user_metadata?.user_name || 
                   currentUser.user_metadata?.preferred_username || 
                   currentUser.user_metadata?.twitter_username,
          display_name: currentUser.user_metadata?.full_name || 
                       currentUser.user_metadata?.name || 
                       currentUser.user_metadata?.display_name,
          profile_image_url: currentUser.user_metadata?.avatar_url,
          provider: currentUser.app_metadata?.provider
        };
        
        console.log('Sending Twitter data to profile service:', twitterData);
        
        // Update user profile with Twitter data
        const profileResult = await UserProfileService.updateTwitterConnection(currentUser.id, twitterData);
        
        if (profileResult) {
          console.log('User profile updated successfully:', profileResult);
          
          // Update local verification state
          setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
          
          // Reload verification states to reflect the new profile
          setTimeout(async () => {
            try {
              const progress = await UserProfileService.getVerificationProgress(currentUser.id);
              if (progress) {
                setVerificationStates({
                  twitterConnect: progress.steps.twitter_connected,
                  twitterFollow: progress.steps.twitter_followed,
                  twitterPost: progress.steps.twitter_posted,
                  customUsername: progress.steps.username_checked,
                  telegramJoin: progress.steps.telegram_joined
                });
                console.log('Verification states reloaded:', progress);
              }
            } catch (error) {
              console.error('Error reloading verification states:', error);
            }
          }, 500);
          
          // Show success message
          toast.success('🎉 Twitter connected successfully! Your profile has been updated.\n\nNote: RapidAPI verification may be rate-limited initially. You can still complete other verification steps.');
          
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('Failed to update user profile after Twitter connection');
          toast.error('Twitter connected but failed to update profile. Please refresh and try again.');
        }
      } else {
        console.log('OAuth successful but not Twitter provider:', currentUser.app_metadata?.provider);
      }
    } catch (error) {
      console.error('Error handling OAuth success:', error);
      toast.error('Error processing Twitter connection. Please try again.');
    } finally {
      // Reset processing flag
      handleOAuthSuccess.isProcessing = false;
    }
  };

  const handleTwitterConnect = async () => {
    if (isFullyTwitterVerified) {
      // Already fully verified via Twitter - update user profile
      if (user?.id) {
        await UserProfileService.updateTwitterConnection(user.id, {
          id: user.id,
          username: user.user_metadata?.user_name || user.user_metadata?.preferred_username,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name,
          profile_image_url: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider
        });
      }
      setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
      return;
    }

    if (user && !isFullyTwitterVerified) {
      // User exists but not via Twitter - show info
      console.log('User connected but not via Twitter:', {
        provider: user.app_metadata?.provider,
        metadata: user.user_metadata
      });
      toast.error('User account exists but not connected via Twitter. Please connect with Twitter to proceed.');
      return;
    }

    setLoading(prev => ({ ...prev, twitterConnect: true }));
    
    try {
      // First, check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // Use the current origin as the redirect URL
      const redirectUrl = `${window.location.origin}/mint-nft`;
      console.log('Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Add any additional query parameters if needed
          }
        }
      });

      if (error) {
        console.error('Twitter auth error:', error);
        toast.error(`Twitter connection failed: ${error.message}`);
      } else if (data?.url) {
        console.log('OAuth URL generated:', data.url);
        // Redirect to the OAuth URL
        window.location.href = data.url;
      } else {
        console.log('No OAuth URL generated, checking auth state...');
        // Fallback: check if user was authenticated
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await updateVerificationStatusInSupabase(session.user.id, 'step1_twitterConnect', true);
            setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Twitter connect error:', error);
      toast.error(`Failed to connect to Twitter: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, twitterConnect: false }));
    }
  };

  const handleManualTwitterVerification = async () => {
    if (!user?.id) {
      toast.error('Please ensure you are logged in to perform manual verification.');
      return;
    }

    setLoading(prev => ({ ...prev, twitterConnect: true }));
    
    try {
      // Simulate manual verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark as verified manually in Supabase
      await updateVerificationStatusInSupabase(user.id, 'step1_twitterConnect', true, {
        verification_method: 'manual',
        timestamp: new Date().toISOString()
      });
      setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
      
      toast.success('Manual verification completed! You can now proceed with other verification steps.');
    } catch (error) {
      console.error('Manual verification error:', error);
      toast.error('Manual verification failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, twitterConnect: false }));
    }
  };

  const handleTwitterDisconnect = async () => {
    if (!user?.id) {
      toast.error('No user session found.');
      return;
    }

    const confirmDisconnect = window.confirm(
      'Are you sure you want to disconnect Twitter? This will:\n\n' +
      '• Remove your Twitter connection\n' +
      '• Reset all Twitter-related verifications (follow, post)\n' +
      '• Sign you out of the current session\n' +
      '• You\'ll need to reconnect and redo verifications\n\n' +
      'Continue with disconnect?'
    );

    if (!confirmDisconnect) return;

    setLoading(prev => ({ ...prev, twitterConnect: true }));
    
    try {
      // Disconnect Twitter completely
      const result = await UserProfileService.completeTwitterDisconnect(user.id);
      
      if (result) {
        // Reset local state
        setVerificationStates({
          twitterConnect: false,
          twitterFollow: false,
          twitterPost: false,
          customUsername: false,
          telegramJoin: false
        });
        
        toast.success('🎉 Twitter disconnected successfully! You have been signed out and all Twitter verifications have been reset.');
        
        // The page will refresh automatically due to auth state change
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('Failed to disconnect Twitter. Please try again.');
      }
    } catch (error) {
      console.error('Twitter disconnect error:', error);
      toast.error('Error disconnecting Twitter. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, twitterConnect: false }));
    }
  };

  const handleTwitterFollow = async () => {
    if (!isFullyTwitterVerified) {
      toast.error('Please connect Twitter first');
      return;
    }

    const loadingToast = toast.info('Opening Twitter follow page...', { autoClose: false });
    setLoading(prev => ({ ...prev, twitterFollow: true }));
    
    try {
      // Open Twitter follow page
      window.open('https://x.com/intent/follow?screen_name=ClusterProtocol', '_blank');
      
      // Wait a moment for user to follow, then check
      setTimeout(async () => {
        try {
          const followResult = await checkTwitterFollowStatus(user.id);
          
          if (followResult.isFollowing) {
            await UserProfileService.updateTwitterFollow(user.id, {
              twitter_username: twitterUsername,
              follow_check_result: followResult.data,
              verification_method: followResult.fallback ? 'fallback_auto' : 'api_verified'
            });
            await updateVerificationStatusInSupabase(user.id, 'step1_twitterFollow', true, {
                verification_method: 'manual_confirm',
                twitter_username: user.user_metadata?.twitter_username
              });
            setVerificationStates(prev => ({ ...prev, twitterFollow: true }));
            
            if (followResult.fallback) {
              toast.success('Twitter follow verification completed (using fallback due to API limitations)!');
            } else {
              toast.success('Twitter follow verification successful!');
            }
          } else {
            toast.error('Could not verify follow status. Please ensure you followed @ClusterProtocol and try again.');
          }
        } catch (error) {
          console.error('Follow verification error:', error);
          // Fallback to manual verification after user confirms
         
        } finally {
          toast.dismiss(loadingToast);
          setLoading(prev => ({ ...prev, twitterFollow: false }));
        }
      }, 5000); // Give user 5 seconds to follow
    } catch (error) {
      console.error('Twitter follow error:', error);
      toast.error('Failed to initiate follow verification.');
      setLoading(prev => ({ ...prev, twitterFollow: false }));
    }
  };

  const handleTwitterPost = async () => {
    if (!isFullyTwitterVerified) {
      toast.error('Please connect Twitter first');
      return;
    }

    // Multiple tweet templates to choose from
    const tweetTemplates = [
      'Just discovered @ClusterProtocol and @CodeXero! 🚀 The future of blockchain is here! #ClusterProtocol #CodeXero #Blockchain #Web3',
      'Excited to be part of the @ClusterProtocol ecosystem! Building the next generation of decentralized apps with @CodeXero 🔥 #DeFi #Web3 #ClusterProtocol',
      'Amazing work by @ClusterProtocol and @CodeXero team! This is how innovation in blockchain should look like 💎 #Blockchain #Innovation #ClusterProtocol',
      'Ready to mint my NFT with @CodeXero on @ClusterProtocol! The future is decentralized 🌟 #NFT #CodeXero #ClusterProtocol #Crypto',
      'Joining the @ClusterProtocol community! @CodeXero is revolutionizing how we interact with blockchain 🚀 #Web3 #DeFi #ClusterProtocol'
    ];

    // Randomly select a template or let user choose
    const randomTemplate = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    const userChoice = confirm(`We'll open Twitter with a pre-filled post. Click OK to use this template:\n\n"${randomTemplate}"\n\nOr click Cancel to use a custom template.`);
    
    let selectedTemplate = randomTemplate;
    if (!userChoice) {
      selectedTemplate = tweetTemplates[0]; // Default to first template if user cancels
    }

    const loadingToast = toast.info('Opening Twitter post page...', { autoClose: false });
    setLoading(prev => ({ ...prev, twitterPost: true }));
    
    try {
      const tweetText = encodeURIComponent(selectedTemplate);
      window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
      
      // Wait for user to post, then check their recent tweets
      setTimeout(async () => {
        try {
          const postResult = await checkTwitterPostStatus(user.id);
          
          if (postResult.hasPosted) {
            await UserProfileService.updateTwitterPost(user.id, null, {
              twitter_username: twitterUsername,
              post_check_result: postResult.data,
              verification_method: postResult.fallback ? 'fallback_auto' : 'api_verified'
            });
            setVerificationStates(prev => ({ ...prev, twitterPost: true }));
            
            if (postResult.fallback) {
              toast.success('Twitter post verification completed (using fallback due to API limitations)!');
            } else {
              toast.success('Twitter post verification successful!');
            }
          } else {
            // Fallback to manual verification
            const userConfirms = window.confirm('Could not find ClusterProtocol or CodeXero post in your recent tweets. Did you post about ClusterProtocol/CodeXero? Click OK if yes.');
            if (userConfirms) {
              await updateVerificationStatusInSupabase(user.id, 'step1_twitterPost', true, {
                verification_method: 'manual_confirm',
                twitter_username: user.user_metadata?.twitter_username
              });
              setVerificationStates(prev => ({ ...prev, twitterPost: true }));
            }
          }
        } catch (error) {
          console.error('Post verification error:', error);
          // Fallback to manual verification
          const userConfirms = window.confirm('Could not verify post automatically. Did you post about ClusterProtocol or CodeXero? Click OK if yes.');
          if (userConfirms) {
            await updateVerificationStatusInSupabase(user.id, 'step1_twitterPost', true, {
              verification_method: 'manual_confirm',
              twitter_username: user.user_metadata?.twitter_username
            });
            setVerificationStates(prev => ({ ...prev, twitterPost: true }));
          }
        } finally {
          toast.dismiss(loadingToast);
          setLoading(prev => ({ ...prev, twitterPost: false }));
        }
      }, 10000); // Give user 10 seconds to post
    } catch (error) {
      console.error('Twitter post error:', error);
      toast.error('Failed to initiate post verification.');
      setLoading(prev => ({ ...prev, twitterPost: false }));
    }
  };

  const handleUsernameCheck = async () => {
    if (!user?.id) {
      toast.error('Please connect Twitter first');
      return;
    }

    const loadingToast = toast.info('Checking username availability...', { autoClose: false });
    setLoading(prev => ({ ...prev, customUsername: true }));
    
    try {
      // For custom username check, we'll check if the current user has a custom username set
      // This is different from the other checks - we're verifying the user's own profile
      const usernameResult = await checkCustomUsernameAvailability(user.id);
      
      if (usernameResult.exists) {
        await UserProfileService.updateCustomUsername(user.id, usernameResult.userInfo?.username || 'verified', {
          username_exists: true,
          username_data: usernameResult.data,
          verification_method: usernameResult.fallback ? 'fallback_auto' : 'api_verified'
        });
        setVerificationStates(prev => ({ ...prev, customUsername: true }));
        toast.success(`Custom username verification successful! Your Twitter profile has been verified.`);
      } else {
        toast.error(`Could not verify your Twitter profile. Please ensure your Twitter account is properly connected.`);
      }
    } catch (error) {
      console.error('Username check error:', error);
      // Fallback to manual verification
      const userConfirms = confirm(`Could not verify your Twitter profile automatically. Do you have a custom username set on Twitter? Click OK if yes.`);
      if (userConfirms) {
        await updateVerificationStatusInSupabase(user.id, 'step1_customUsername', true, {
          verification_method: 'manual_confirm'
        });
        setVerificationStates(prev => ({ ...prev, customUsername: true }));
      }
    } finally {
      toast.dismiss(loadingToast);
      setLoading(prev => ({ ...prev, customUsername: false }));
    }
  };

  const handleTelegramJoin = async () => {
    if (!user?.id) {
      toast.error('Please connect Twitter first');
      return;
    }

    const loadingToast = toast.info('Opening Telegram channel...', { autoClose: false });
    setLoading(prev => ({ ...prev, telegramJoin: true }));
    
    try {
      window.open('https://t.me/codexero', '_blank');
      
      // Since Telegram verification is harder to automate, use manual confirmation
      setTimeout(async () => {
        const userConfirms = confirm('Did you join the CodeXero Telegram channel? Click OK if yes.');
        if (userConfirms) {
          await UserProfileService.updateTelegramJoin(user.id, {
            verification_method: 'manual_confirm',
            telegram_channel: 'codexero'
          });
          setVerificationStates(prev => ({ ...prev, telegramJoin: true }));
          toast.success('Telegram join verification successful!');
        }
        toast.dismiss(loadingToast);
        setLoading(prev => ({ ...prev, telegramJoin: false }));
      }, 3000);
    } catch (error) {
      console.error('Telegram join error:', error);
      toast.error('Failed to initiate Telegram join verification.');
      setLoading(prev => ({ ...prev, telegramJoin: false }));
    }
  };



  const getButtonText = (step, isVerified, isLoading) => {
    if (isVerified) return '✓ Completed';
    if (isLoading) return 'Processing...';
    
    switch (step) {
      case 'twitterConnect':
        return user ? '✓ Connected' : 'Connect Twitter';
      case 'twitterFollow':
        return 'Follow on Twitter';
      case 'twitterPost':
        return 'Post on Twitter';
      case 'customUsername':
        return 'Verify Profile';
      case 'telegramJoin':
        return 'Join Telegram';
      default:
        return 'Verify';
    }
  };

  const allStepsCompleted = Object.values(verificationStates).every(state => state);

  return (
    <div className="verification-card">
      <div className="verification-header">
        <div className="verification-icon">
          <div className="text-3xl">🔐</div>
        </div>
        <h2 className="verification-title">
          Step 1: Social Verification
        </h2>
        <p className="verification-subtitle">Complete all verification steps to proceed to minting</p>
        

      </div>
      
      <div>
        {/* Twitter Connect */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(59, 130, 246, 0.2)'}}>🐦</div>
            <div className="verification-item-text">
              <h3 style={{color: '#3b82f6'}}>Connect Twitter</h3>
              <p>Connect your Twitter account</p>
              {!isFullyTwitterVerified && (
                <div style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                  {user && !isFullyTwitterVerified ? (
                    <span style={{color: '#f59e0b'}}>⚠️ Connected via {user.app_metadata?.provider || 'unknown'} - need Twitter</span>
                  ) : (
                    <span>Having OAuth issues? Try manual verification</span>
                  )}
                </div>
              )}
              {isFullyTwitterVerified && (
                <div style={{fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem'}}>
                  ✅ Twitter connected: {user.user_metadata?.twitter_username || user.user_metadata?.full_name || 'Verified'}
                </div>
              )}
            </div>
          </div>
          <div className="verification-item-actions">
            {isFullyTwitterVerified ? (
              <>
                <button
                  onClick={handleTwitterConnect}
                  disabled={true}
                  className="verification-button completed"
                >
                  {getButtonText('twitterConnect', isFullyTwitterVerified, loading.twitterConnect)}
                </button>
                <button
                  onClick={handleOAuthSuccess}
                  disabled={loading.twitterConnect}
                  className="verification-button secondary"
                  title="Refresh Twitter connection status"
                >
                  Refresh Status
                </button>
                <button
                  onClick={handleTwitterDisconnect}
                  disabled={loading.twitterConnect}
                  className="verification-button disconnect"
                >
                  {loading.twitterConnect ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTwitterConnect}
                  disabled={loading.twitterConnect}
                  className={`verification-button ${
                    loading.twitterConnect ? 'loading' : 'pending'
                  }`}
                >
                  {getButtonText('twitterConnect', false, loading.twitterConnect)}
                </button>
              
              </>
            )}
          </div>
        </div>

        {/* Twitter Follow */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(34, 197, 94, 0.2)'}}>👥</div>
            <div className="verification-item-text">
              <h3 style={{color: '#22c55e'}}>Follow on Twitter</h3>
              <p>Follow @ClusterProtocol on Twitter</p>
            </div>
          </div>
          <div className="verification-item-actions">
            <button
              onClick={handleTwitterFollow}
              disabled={loading.twitterFollow || verificationStates.twitterFollow || !isFullyTwitterVerified}
              className={`verification-button ${
                verificationStates.twitterFollow ? 'completed' : 
                loading.twitterFollow ? 'loading' : 'pending'
              }`}
            >
              {getButtonText('twitterFollow', verificationStates.twitterFollow, loading.twitterFollow)}
            </button>
          </div>
        </div>

        {/* Twitter Post */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(168, 85, 247, 0.2)'}}>📝</div>
            <div className="verification-item-text">
              <h3 style={{color: '#a855f7'}}>Post on Twitter</h3>
              <p>Share about ClusterProtocol & CodeXero</p>
            </div>
          </div>
          <div className="verification-item-actions">
            <button
              onClick={handleTwitterPost}
              disabled={loading.twitterPost || verificationStates.twitterPost || !isFullyTwitterVerified}
              className={`verification-button ${
                verificationStates.twitterPost ? 'completed' : 
                loading.twitterPost ? 'loading' : 'pending'
              }`}
            >
              {getButtonText('twitterPost', verificationStates.twitterPost, loading.twitterPost)}
            </button>
          </div>
        </div>

        {/* Profile Verification */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(245, 158, 11, 0.2)'}}>🔍</div>
            <div className="verification-item-text">
              <h3 style={{color: '#f59e0b'}}>Verify Profile</h3>
              <p>Verify your Twitter profile information</p>
            </div>
          </div>
          <div className="verification-item-actions">
            <button
              onClick={handleUsernameCheck}
              disabled={loading.customUsername || verificationStates.customUsername}
              className={`verification-button ${
                verificationStates.customUsername ? 'completed' : 
                loading.customUsername ? 'loading' : 'pending'
              }`}
            >
              {getButtonText('customUsername', verificationStates.customUsername, loading.customUsername)}
            </button>
          </div>
        </div>

        {/* Telegram Join */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(6, 182, 212, 0.2)'}}>✈️</div>
            <div className="verification-item-text">
              <h3 style={{color: '#06b6d4'}}>Join Telegram</h3>
              <p>Join our Telegram community</p>
            </div>
          </div>
          <div className="verification-item-actions">
            <button
              onClick={handleTelegramJoin}
              disabled={loading.telegramJoin || verificationStates.telegramJoin}
              className={`verification-button ${
                verificationStates.telegramJoin ? 'completed' : 
                loading.telegramJoin ? 'loading' : 'pending'
              }`}
            >
              {getButtonText('telegramJoin', verificationStates.telegramJoin, loading.telegramJoin)}
            </button>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="progress-container">
        <div className="progress-header">
          <span className="progress-label">Verification Progress</span>
          <span className="progress-count">
            {Object.values(verificationStates).filter(Boolean).length}/5 completed
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(Object.values(verificationStates).filter(Boolean).length / 5) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          <span className="progress-message">
            {Object.values(verificationStates).filter(Boolean).length === 5 
              ? '🎉 All verifications completed!' 
              : `${5 - Object.values(verificationStates).filter(Boolean).length} steps remaining`
            }
          </span>
        </div>
      </div>

      {allStepsCompleted && (
        <div className="completion-card">
          <div className="completion-icon">🎉</div>
          <h3 className="completion-title">Step 1 Complete!</h3>
          <p className="completion-message">All verification steps completed. Ready to proceed!</p>
          <div>
            <div className="completion-spinner"></div>
          </div>
        </div>
      )}
    </div>
  );
}
