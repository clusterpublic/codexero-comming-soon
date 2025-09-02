import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { UserProfileService } from '../services/userProfileService';
import { 
  checkTwitterFollowStatus, 
  checkTwitterPostStatus, 
  checkDisplayNameSequences,
  testRapidAPIAccess 
} from '../services/twitterVerificationService';
import { toast } from 'react-toastify';
import TelegramVerificationService from '../services/telegramVerificationService';



// Target Twitter user ID for follow verification
const TARGET_TWITTER_USER_ID = '1581344622390829056';

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

  // State for storing sequence result message
  const [sequenceResultMessage, setSequenceResultMessage] = useState(null);

  const [user, setUser] = useState(null);
console.log("user", user)

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



  // Check if all steps are completed (excluding Telegram for now)
  useEffect(() => {
    // For now, we'll skip Telegram verification and only require Twitter steps
    const requiredSteps = {
      twitterConnect: verificationStates.twitterConnect,
      twitterFollow: verificationStates.twitterFollow,
      twitterPost: verificationStates.twitterPost,
      customUsername: verificationStates.customUsername
      // telegramJoin is skipped for now
    };
    
    const allRequiredCompleted = Object.values(requiredSteps).every(state => state);
    if (allRequiredCompleted && onStepComplete) {
      onStepComplete();
    }
  }, [verificationStates, onStepComplete]);

  // Clear sequence messages when verification states change
  useEffect(() => {
    // Clear any existing sequence messages when states change
    clearSequenceMessages();
  }, [verificationStates.customUsername]);

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
          // Note: Verification states are managed through the profile service
          console.log('Twitter OAuth succeeded - verification states will be updated through profile service');
          
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

      console.log('Current user:', currentUser);
      
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
          provider: currentUser.app_metadata?.provider,
          user_id:currentUser.user_metadata?.provider_id
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
          provider: user.app_metadata?.provider,
          user_id:user.user_metadata?.provider_id
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
            console.log('User authenticated - verification states will be updated through profile service');
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

  // Function to check verification status
  const checkTelegramChannelVerification = async () => {
    if (!user?.id) return;
    
    try {
      const storedData = sessionStorage.getItem('telegram_channel_verification');
      if (!storedData) return;
      
      const { code, userId, timestamp } = JSON.parse(storedData);
      
      // Check if verification is still valid (24 hours)
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem('telegram_channel_verification');
        toast.error('Verification code expired. Please generate a new one.');
        return;
      }
      
      // Check if user ID matches current user
      if (userId !== user.id) {
        sessionStorage.removeItem('telegram_channel_verification');
        return;
      }
      
      // Initialize Telegram service
      const telegramService = new TelegramVerificationService();
      
      // Check if user is member of channel
      const membership = await telegramService.checkChannelMembership(userId);
      
      if (membership.isMember) {
        // Clear stored data
        sessionStorage.removeItem('telegram_channel_verification');
        
        // Update verification status in user profile
        await UserProfileService.updateTelegramJoin(user.id, {
          verification_method: 'channel_membership_verification',
          telegram_channel: '@codexero_testing_1',
          verification_code: code,
          verified_at: new Date().toISOString(),
          membership_status: membership.status
        });
        
        setVerificationStates(prev => ({ ...prev, telegramJoin: true }));
        toast.success('✅ Telegram verification completed! Welcome to the community!');
        
      } else {
        toast.error('❌ Verification failed. Please make sure you joined the channel and try again.');
      }
      
    } catch (error) {
      console.error('Error checking channel verification:', error);
      toast.error(`Failed to check verification status: ${error.message}`);
    }
  };

  // Enhanced verification button handler
  const handleTelegramVerification = async () => {
    if (verificationStates.telegramJoin) {
      // Already verified
      return;
    }
    
    // Check if we have a pending verification
    const storedData = sessionStorage.getItem('telegram_channel_verification');
    
    if (storedData) {
      // Check verification status
      await checkTelegramChannelVerification();
    } else {
      // Start new verification process
      await handleTelegramJoin();
    }
  };

  // Update the button click handler
  const handleTelegramButtonClick = handleTelegramVerification;
  
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
        // Clear any displayed sequence messages
        clearSequenceMessages();
        
        // Clear sequence result message from state
        setSequenceResultMessage(null);
        
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
      // Open Twitter follow page for the target user ID
      window.open(`https://x.com/intent/follow?user_id=${TARGET_TWITTER_USER_ID}`, '_blank');
      
      // Wait a moment for user to follow, then check
      setTimeout(async () => {
        try {
          // Get the Twitter user ID from the user's profile
          const profile = await UserProfileService.getProfileByUserId(user.id);
          const twitterUserId = profile?.twitter_user_id;
          
          if (!twitterUserId) {
            toast.error('Twitter user ID not found. Please reconnect your Twitter account.');
            return;
          }
          
          const followResult = await checkTwitterFollowStatus(twitterUserId, TARGET_TWITTER_USER_ID);
          
          if (followResult.isFollowing) {
            await UserProfileService.updateTwitterFollow(user.id, {
              twitter_username: profile?.twitter_username,
              follow_check_result: followResult.data,
              verification_method: followResult.fallback ? 'fallback_auto' : 'api_verified'
            });
            setVerificationStates(prev => ({ ...prev, twitterFollow: true }));
            
            if (followResult.fallback) {
              toast.success('Twitter follow verification completed (using fallback due to API limitations)!');
            } else {
              toast.success('Twitter follow verification successful! You are now following the target user.');
            }
          } else {
            toast.error('Could not verify follow status. Please ensure you followed the target user and try again.');
          }
        } catch (error) {
          console.error('Follow verification error:', error);
          // Fallback to manual verification after user confirms
          const userConfirms = window.confirm('Could not verify follow automatically. Did you follow the target user? Click OK if yes.');
          if (userConfirms) {
            await UserProfileService.updateTwitterFollow(user.id, {
              verification_method: 'manual_confirm'
            });
            setVerificationStates(prev => ({ ...prev, twitterFollow: true }));
            toast.success('Manual follow verification completed!');
          }
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

    // Get the target user's latest tweet content to retweet
    const targetContent = `@ClusterProtocol`;
    const tweetText = `Just discovered @ClusterProtocol and @CodeXero! 🚀 The future of blockchain is here! #ClusterProtocol #CodeXero #Blockchain #Web3`
    
    const loadingToast = toast.info('Opening Twitter retweet page...', { autoClose: false });
    setLoading(prev => ({ ...prev, twitterPost: true }));
    
    try {
      // Open Twitter retweet page for the target user
      window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
      
      // Start polling for the retweet
      setTimeout(async () => {
        try {
          // Get the Twitter user ID from the user's profile
          const profile = await UserProfileService.getProfileByUserId(user.id);
          const twitterUserId = profile?.twitter_user_id;
          
          if (!twitterUserId) {
            toast.error('Twitter user ID not found. Please reconnect your Twitter account.');
            return;
          }
          
          // Update loading message to show polling status
          toast.update(loadingToast, {
            render: 'Checking for retweet... (this may take up to 1 minute)',
            type: 'info',
            autoClose: false
          });
          
          // Check for retweet with polling (up to 20 attempts = 1 minute)
          const postResult = await checkTwitterPostStatus(twitterUserId, targetContent, TARGET_TWITTER_USER_ID, 20);
          
          if (postResult.hasPosted) {
            // Update loading message
            toast.update(loadingToast, {
              render: `✅ Retweet found! Updating verification status...`,
              type: 'success',
              autoClose: 3000
            });
            
            await UserProfileService.updateTwitterPost(user.id, null, {
              twitter_username: profile?.twitter_username,
              post_check_result: postResult.data,
              verification_method: postResult.fallback ? 'fallback_auto' : 'api_verified',
              match_type: postResult.matchType,
              tweet_id: postResult.tweetId,
              attempts: postResult.attempt
            });
            setVerificationStates(prev => ({ ...prev, twitterPost: true }));
            
            if (postResult.fallback) {
              toast.success('Twitter retweet verification completed (using fallback due to API limitations)!');
            } else {
              toast.success(`Twitter retweet verification successful! Found retweet after ${postResult.attempt} attempts.`);
            }
          } else {
            // No retweet found after all attempts
            toast.update(loadingToast, {
              render: '❌ No retweet found after 1 minute. Please try again or use manual verification.',
              type: 'error',
              autoClose: 5000
            });

          }
        } catch (error) {
          console.error('Post verification error:', error);
          toast.update(loadingToast, {
            render: '❌ Error during verification. Please try manual verification.',
            type: 'error',
            autoClose: 5000
          });
          
          // Fallback to manual verification
          const userConfirms = window.confirm('Could not verify retweet automatically. Did you retweet the CodeXero post? Click OK if yes.');
          if (userConfirms) {
            await UserProfileService.updateTwitterPost(user.id, null, {
              verification_method: 'manual_confirm'
            });
            setVerificationStates(prev => ({ ...prev, twitterPost: true }));
            toast.success('Manual retweet verification completed!');
          }
        } finally {
          setLoading(prev => ({ ...prev, twitterPost: false }));
        }
      }, 3000); // Give user 3 seconds to start retweeting
    } catch (error) {
      console.error('Twitter post error:', error);
      toast.error('Failed to initiate retweet verification.');
      setLoading(prev => ({ ...prev, twitterPost: false }));
    }
  };

  const handleUsernameCheck = async () => {
    if (!user?.id) {
      toast.error('Please connect Twitter first');
      return;
    }

    const loadingToast = toast.info('Checking display name for verification sequences...', { autoClose: false });
    setLoading(prev => ({ ...prev, customUsername: true }));
    
    try {
      // Get the Twitter user ID from the user's profile
      const profile = await UserProfileService.getProfileByUserId(user.id);
      const twitterUserId = profile?.twitter_user_id;
      
      if (!twitterUserId) {
        toast.error('Twitter user ID not found. Please reconnect your Twitter account.');
        return;
      }
      
      // Define the character sequences to check for in display name
      // You can modify these sequences as needed
      const verificationSequences = ['abc', 'cluster', 'codexero', '🚀', '⭐'];
      
      // Check if display name contains any of the verification sequences
      const displayNameResult = await checkDisplayNameSequences(twitterUserId, verificationSequences);
      
      // Always mark as completed if RapidAPI call succeeds (regardless of sequence detection)
      if (displayNameResult.data || displayNameResult.fallback) {
        // Update verification status - always mark as completed
        await UserProfileService.updateCustomUsername(user.id, 'verified', {
          display_name_verified: true,
          sequences_found: displayNameResult.sequencesFound || [],
          display_name: displayNameResult.displayName || 'unknown',
          verification_method: displayNameResult.fallback ? 'fallback_auto' : 'api_verified',
          verification_data: displayNameResult.data,
          verification_result: displayNameResult.verified ? 'sequences_found' : 'no_sequences_found'
        });
        
        setVerificationStates(prev => ({ ...prev, customUsername: true }));
        
        // Show different messages based on sequence detection
        if (displayNameResult.verified) {
          // ✅ Sequences found - show success message
          toast.success(`✅ Display name verification completed! Found sequences: ${displayNameResult.sequencesFound.join(', ')}`);
          
          // Set success message in state
          setSequenceResultMessage({
            type: 'success',
            message: `🎉 Congratulations! Your display name "${displayNameResult.displayName}" contains special sequences: ${displayNameResult.sequencesFound.join(', ')}`
          });
          
        } else {
          // ⚠️ No sequences found - show warning message
          toast.warning(`⚠️ Display name verification completed, but no special sequences found.`);
          
          // Set warning message in state
          setSequenceResultMessage({
            type: 'warning',
            message: `⚠️ Your display name "${displayNameResult.displayName}" does not contain the required special sequences: ${verificationSequences.join(', ')}`
          });
        }
        
        console.log('Display name verification result:', {
          verified: true, // Always true if API succeeds
          sequencesFound: displayNameResult.sequencesFound,
          displayName: displayNameResult.displayName,
          hasSequences: displayNameResult.verified
        });
        
      } else {
        // API call failed completely
        toast.error(`❌ Display name verification failed. Could not connect to Twitter API.`);
        
        // Clear any existing message
        setSequenceResultMessage(null);
        
        console.log('Display name verification failed:', {
          verified: false,
          reason: 'api_failure',
          displayName: displayNameResult.displayName
        });
      }
      
    } catch (error) {
      console.error('Display name check error:', error);
      
      // Fallback to manual verification
      const verificationSequences = ['abc', 'cluster', 'codexero', '🚀', '⭐'];
      const userConfirms = confirm(`Could not verify your display name automatically. Does your Twitter display name contain any of these sequences: ${verificationSequences.join(', ')}? Click OK if yes.`);
      
      if (userConfirms) {
        await UserProfileService.updateCustomUsername(user.id, 'verified', {
          verification_method: 'manual_confirm',
          display_name_verified: true
        });
        setVerificationStates(prev => ({ ...prev, customUsername: true }));
        toast.success('Manual display name verification completed!');
        
        // Set manual verification message
        setSequenceResultMessage({
          type: 'success',
          message: '✅ Manual display name verification completed!'
        });
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

    setLoading(prev => ({ ...prev, telegramJoin: true }));
    
    try {
      // Skip Telegram verification for now - always mark as completed
      console.log('Telegram verification skipped - marking as completed');
      
      // Mark as completed immediately
      setVerificationStates(prev => ({ ...prev, telegramJoin: true }));
      toast.success('✅ Telegram verification completed! (Skipped for now)');
      
    } catch (error) {
      console.error('Telegram verification error:', error);
      toast.error(`Failed to complete verification: ${error.message}`);
    } finally {
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
        return 'Follow Target User';
      case 'twitterPost':
        return 'Retweet CodeXero';
      case 'customUsername':
        return 'Check Display Name';
      case 'telegramJoin':
        return 'Skip for Now';
      default:
        return 'Verify';
    }
  };

  const allStepsCompleted = Object.values(verificationStates).every(state => state);

  // Helper function to clear any existing sequence result messages
  const clearSequenceMessages = () => {
    const messages = document.querySelectorAll('.sequence-result-message');
    messages.forEach(message => message.remove());
    
    // Also clear the state message
    setSequenceResultMessage(null);
  };

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
              <p>Follow the target user on Twitter</p>
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

        {/* Twitter Retweet */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(168, 85, 247, 0.2)'}}>🔄</div>
            <div className="verification-item-text">
              <h3 style={{color: '#a855f7'}}>Retweet CodeXero</h3>
              <p>Retweet the CodeXero announcement</p>
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
          <div>
            <div className='flex justify-between items-center'>
              <div className="verification-item-info">
                <div className="verification-item-icon" style={{background: 'rgba(245, 158, 11, 0.2)'}}>🔍</div>
                <div className="verification-item-text">
                  <h3 style={{color: '#f59e0b'}}>Verify Display Name</h3>
                  <p>Check if your Twitter display name contains verification sequences</p>
                </div>
              </div>
              <div className="verification-item-actions">
                <button
                  onClick={handleUsernameCheck}
                  className={`verification-button ${
                    verificationStates.customUsername ? 'completed' : 
                    loading.customUsername ? 'loading' : 'pending'
                  }`}
                >
                  {getButtonText('customUsername', verificationStates.customUsername, loading.customUsername)}
                </button>
              </div>
            </div>
            {/* Sequence Result Message */}
            {sequenceResultMessage && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                textAlign: 'center',
                background: sequenceResultMessage.type === 'success' 
                  ? 'rgba(34, 197, 94, 0.1)' 
                  : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${
                  sequenceResultMessage.type === 'success' ? '#22c55e' : '#f59e0b'
                }`,
                color: sequenceResultMessage.type === 'success' ? '#22c55e' : '#f59e0b'
              }}>
                {sequenceResultMessage.message}
              </div>
            )}
          </div>
        </div>

        {/* Telegram Join */}
        <div className="verification-item">
          <div className="verification-item-info">
            <div className="verification-item-icon" style={{background: 'rgba(6, 182, 212, 0.2)'}}>✈️</div>
            <div className="verification-item-text">
              <h3 style={{color: '#06b6d4'}}>Join Telegram</h3>
              <p>Join our Telegram community (Skipped for now - click to mark as completed)</p>
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

      {/* Skip for Testing Button */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => {
            // Mark all required steps as completed for testing
            setVerificationStates({
              twitterConnect: true,
              twitterFollow: true,
              twitterPost: true,
              customUsername: true,
              telegramJoin: true
            });
          }}
          style={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          🚀 Skip for Testing (Mark All Complete)
        </button>
      </div>

      {/* Check if all required steps are completed */}
      {(() => {
        const requiredSteps = {
          twitterConnect: verificationStates.twitterConnect,
          twitterFollow: verificationStates.twitterFollow,
          twitterPost: verificationStates.twitterPost,
          customUsername: verificationStates.customUsername
        };
        return Object.values(requiredSteps).every(state => state);
      })() && (
        <div className="completion-card">
          <div className="completion-icon">🎉</div>
          <h3 className="completion-title">Step 1 Complete!</h3>
          <p className="completion-message">All required verification steps completed. Ready to proceed!</p>
          <div>
            <div className="completion-spinner"></div>
          </div>
        </div>
      )}

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
            {Object.values(verificationStates).filter(Boolean).length >= 4
              ? '🎉 All required verifications completed!' 
              : `${4 - Object.values(verificationStates).filter(Boolean).length} required steps remaining`
            }
          </span>
        </div>
      </div>


    </div>
  );
}
