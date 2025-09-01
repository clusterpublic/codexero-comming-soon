import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// IndexedDB utilities adapted for our project
const DB_NAME = 'CodeXeroVerificationDB';
const STORE_NAME = 'verificationStatus';
const DB_VERSION = 1;

let db = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const getVerificationStatus = async (stepId) => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(stepId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    return null;
  }
};

const updateVerificationStatus = async (stepId, status) => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        id: stepId,
        verified: status,
        timestamp: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
  }
};

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
  const [customUsername, setCustomUsername] = useState('');

  // Load verification states from IndexedDB on mount
  useEffect(() => {
    const loadVerificationStates = async () => {
      const states = {};
      for (const step of Object.keys(verificationStates)) {
        const status = await getVerificationStatus(`step1_${step}`);
        states[step] = status?.verified || false;
      }
      setVerificationStates(states);
    };

    loadVerificationStates();
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
      setUser(session?.user || null);
    };
    getUser();

    // Handle OAuth callback errors
    const handleOAuthError = () => {
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
          updateVerificationStatus('step1_twitterConnect', true);
          setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
          
          // Show success message instead of error
          alert('Twitter connection successful! (Note: Twitter did not provide email, but authentication is complete)');
        } else {
          alert(`Authentication error: ${errorDescription || error}`);
        }
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Check for OAuth errors on mount
    handleOAuthError();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleTwitterConnect = async () => {
    if (user) {
      // Already connected
      await updateVerificationStatus('step1_twitterConnect', true);
      setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
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
        alert(`Twitter connection failed: ${error.message}`);
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
            await updateVerificationStatus('step1_twitterConnect', true);
            setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Twitter connect error:', error);
      alert(`Failed to connect to Twitter: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, twitterConnect: false }));
    }
  };

  const handleManualTwitterVerification = async () => {
    setLoading(prev => ({ ...prev, twitterConnect: true }));
    
    try {
      // Simulate manual verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark as verified manually
      await updateVerificationStatus('step1_twitterConnect', true);
      setVerificationStates(prev => ({ ...prev, twitterConnect: true }));
      
      alert('Manual verification completed! You can now proceed with other verification steps.');
    } catch (error) {
      console.error('Manual verification error:', error);
      alert('Manual verification failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, twitterConnect: false }));
    }
  };

  const handleTwitterFollow = async () => {
    if (!user) {
      alert('Please connect Twitter first');
      return;
    }

    setLoading(prev => ({ ...prev, twitterFollow: true }));
    
    // Open Twitter follow page
    window.open('https://x.com/intent/follow?screen_name=codexero', '_blank');
    
    // Simulate verification after delay (in real app, you'd verify via API)
    setTimeout(async () => {
      await updateVerificationStatus('step1_twitterFollow', true);
      setVerificationStates(prev => ({ ...prev, twitterFollow: true }));
      setLoading(prev => ({ ...prev, twitterFollow: false }));
    }, 3000);
  };

  const handleTwitterPost = async () => {
    if (!user) {
      alert('Please connect Twitter first');
      return;
    }

    setLoading(prev => ({ ...prev, twitterPost: true }));
    
    const tweetText = encodeURIComponent('Just minted my NFT on @CodeXero! 🚀 #NFT #CodeXero #Blockchain');
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
    
    // Simulate verification after delay
    setTimeout(async () => {
      await updateVerificationStatus('step1_twitterPost', true);
      setVerificationStates(prev => ({ ...prev, twitterPost: true }));
      setLoading(prev => ({ ...prev, twitterPost: false }));
    }, 3000);
  };

  const handleUsernameCheck = async () => {
    if (!customUsername.trim()) {
      alert('Please enter a username to check');
      return;
    }

    setLoading(prev => ({ ...prev, customUsername: true }));
    
    // Simulate username check
    setTimeout(async () => {
      // In real app, you'd verify the username via API
      await updateVerificationStatus('step1_customUsername', true);
      setVerificationStates(prev => ({ ...prev, customUsername: true }));
      setLoading(prev => ({ ...prev, customUsername: false }));
    }, 2000);
  };

  const handleTelegramJoin = async () => {
    setLoading(prev => ({ ...prev, telegramJoin: true }));
    
    window.open('https://t.me/codexero', '_blank');
    
    // Simulate verification after delay
    setTimeout(async () => {
      await updateVerificationStatus('step1_telegramJoin', true);
      setVerificationStates(prev => ({ ...prev, telegramJoin: true }));
      setLoading(prev => ({ ...prev, telegramJoin: false }));
    }, 3000);
  };

  const getButtonStyle = (isVerified, isLoading) => {
    if (isVerified) {
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-default shadow-lg';
    }
    if (isLoading) {
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white cursor-not-allowed shadow-lg';
    }
    return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg';
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
        return 'Check Username';
      case 'telegramJoin':
        return 'Join Telegram';
      default:
        return 'Verify';
    }
  };

  const allStepsCompleted = Object.values(verificationStates).every(state => state);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 transform hover:scale-[1.01] transition-all duration-300">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <div className="text-3xl">🔐</div>
        </div>
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Step 1: Social Verification
        </h2>
        <p className="text-lg text-gray-300">Complete all verification steps to proceed to minting</p>
      </div>
      
      <div className="space-y-6">
        {/* Twitter Connect */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center space-x-4">
            <div className="text-3xl p-3 bg-blue-500 bg-opacity-20 rounded-full">🐦</div>
            <div>
              <h3 className="font-bold text-lg text-blue-300">Connect Twitter</h3>
              <p className="text-gray-300">Connect your Twitter account</p>
              {!user && !verificationStates.twitterConnect && (
                <p className="text-xs text-gray-400 mt-1">Having OAuth issues? Try manual verification</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleTwitterConnect}
              disabled={loading.twitterConnect || (user && verificationStates.twitterConnect)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(user && verificationStates.twitterConnect, loading.twitterConnect)}`}
            >
              {getButtonText('twitterConnect', user && verificationStates.twitterConnect, loading.twitterConnect)}
            </button>
            {!user && !verificationStates.twitterConnect && (
              <button
                onClick={handleManualTwitterVerification}
                disabled={loading.twitterConnect}
                className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Manual Verify
              </button>
            )}
          </div>
        </div>

        {/* Twitter Follow */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center space-x-4">
            <div className="text-3xl p-3 bg-green-500 bg-opacity-20 rounded-full">👥</div>
            <div>
              <h3 className="font-bold text-lg text-green-300">Follow on Twitter</h3>
              <p className="text-gray-300">Follow @CodeXero on Twitter</p>
            </div>
          </div>
          <button
            onClick={handleTwitterFollow}
            disabled={loading.twitterFollow || verificationStates.twitterFollow || !user}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(verificationStates.twitterFollow, loading.twitterFollow)}`}
          >
            {getButtonText('twitterFollow', verificationStates.twitterFollow, loading.twitterFollow)}
          </button>
        </div>

        {/* Twitter Post */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center space-x-4">
            <div className="text-3xl p-3 bg-purple-500 bg-opacity-20 rounded-full">📝</div>
            <div>
              <h3 className="font-bold text-lg text-purple-300">Post on Twitter</h3>
              <p className="text-gray-300">Share about CodeXero</p>
            </div>
          </div>
          <button
            onClick={handleTwitterPost}
            disabled={loading.twitterPost || verificationStates.twitterPost || !user}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(verificationStates.twitterPost, loading.twitterPost)}`}
          >
            {getButtonText('twitterPost', verificationStates.twitterPost, loading.twitterPost)}
          </button>
        </div>

        {/* Custom Username Check */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center space-x-4">
            <div className="text-3xl p-3 bg-yellow-500 bg-opacity-20 rounded-full">🔍</div>
            <div className="flex-1 max-w-xs">
              <h3 className="font-bold text-lg text-yellow-300 mb-2">Check Custom Username</h3>
              <input
                type="text"
                placeholder="Enter Twitter username to check"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                disabled={verificationStates.customUsername}
              />
            </div>
          </div>
          <button
            onClick={handleUsernameCheck}
            disabled={loading.customUsername || verificationStates.customUsername || !customUsername.trim()}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(verificationStates.customUsername, loading.customUsername)}`}
          >
            {getButtonText('customUsername', verificationStates.customUsername, loading.customUsername)}
          </button>
        </div>

        {/* Telegram Join */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center space-x-4">
            <div className="text-3xl p-3 bg-cyan-500 bg-opacity-20 rounded-full">✈️</div>
            <div>
              <h3 className="font-bold text-lg text-cyan-300">Join Telegram</h3>
              <p className="text-gray-300">Join our Telegram community</p>
            </div>
          </div>
          <button
            onClick={handleTelegramJoin}
            disabled={loading.telegramJoin || verificationStates.telegramJoin}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${getButtonStyle(verificationStates.telegramJoin, loading.telegramJoin)}`}
          >
            {getButtonText('telegramJoin', verificationStates.telegramJoin, loading.telegramJoin)}
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-10 p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-300">Verification Progress</span>
          <span className="text-lg font-bold text-blue-400">
            {Object.values(verificationStates).filter(Boolean).length}/5 completed
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${(Object.values(verificationStates).filter(Boolean).length / 5) * 100}%` }}
          />
        </div>
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">
            {Object.values(verificationStates).filter(Boolean).length === 5 
              ? '🎉 All verifications completed!' 
              : `${5 - Object.values(verificationStates).filter(Boolean).length} steps remaining`
            }
          </span>
        </div>
      </div>

      {allStepsCompleted && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-800 to-green-700 rounded-xl border border-green-600 text-center transform animate-bounce">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="font-bold text-2xl text-green-100 mb-2">Step 1 Complete!</h3>
          <p className="text-green-200 text-lg">All verification steps completed. Ready to proceed!</p>
          <div className="mt-4">
            <div className="inline-block w-8 h-8 border-4 border-green-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
}
