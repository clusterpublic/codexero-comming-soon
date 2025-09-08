// Twitter Verification Service - handles Twitter API verification operations
const RAPIDAPI_KEY = '47822bb3bemsha001819593243e5p1b709djsn6666ce549748';
const RAPIDAPI_HOST = 'twitter-x.p.rapidapi.com';

/**
 * Helper function to make HTTP requests to RapidAPI
 */
async function makeRequest(path) {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making request to RapidAPI:', error);
    throw error;
  }
}

/**
 * Parse following entries from the API response
 */
function parseFollowingEntries(responseData) {
  const followingList = [];
  try {
    if (responseData?.data?.user?.result?.timeline?.timeline?.instructions) {
      const instructions = responseData.data.user.result.timeline.timeline.instructions;
      const addEntriesInstruction = instructions.find(inst => inst.type === 'TimelineAddEntries');
      if (addEntriesInstruction && addEntriesInstruction.entries) {
        addEntriesInstruction.entries.forEach(entry => {
          if (entry.content?.itemContent?.itemType === 'TimelineUser') {
            const userResult = entry.content.itemContent.user_results?.result;
            if (userResult) {
              followingList.push({
                id: userResult.id,
                rest_id: userResult.rest_id
              });
            }
          }
        });
      }
    }
  } catch (err) {
    console.error('Error parsing following list:', err);
  }
  return followingList;
}

/**
 * Extract cursor for pagination from API response
 */
function extractCursor(responseData) {
  try {
    if (responseData?.data?.user?.result?.timeline?.timeline?.instructions) {
      const instructions = responseData.data.user.result.timeline.timeline.instructions;
      const addEntriesInstruction = instructions.find(inst => inst.type === 'TimelineAddEntries');
      if (addEntriesInstruction && addEntriesInstruction.entries) {
        // Look for cursor entry at the end
        const cursorEntry = addEntriesInstruction.entries.find(entry => 
          entry.content?.entryType === 'TimelineTimelineCursor' && 
          entry.content?.cursorType === 'Bottom'
        );
        if (cursorEntry && cursorEntry.content?.value) {
          return cursorEntry.content.value;
        }
      }
    }
  } catch (err) {
    console.error('Error extracting cursor:', err);
  }
  return null;
}

/**
 * Check if user is following a target account (by Twitter IDs only) with pagination
 */
export async function checkTwitterFollowStatus(userId, targetUserId) {
  console.log(`Checking if user ${userId} follows ${targetUserId} with pagination`);
  
  let cursor = null;
  let pageCount = 0;
  const maxPages = 20; // Limit to prevent infinite loops (20 * 100 = 2000 follows max)
  let totalChecked = 0;

  try {
    while (pageCount < maxPages) {
      pageCount++;
      console.log(`Fetching page ${pageCount} for user ${userId}${cursor ? ` with cursor: ${cursor.substring(0, 20)}...` : ''}`);

      // Build the path with cursor if available
      let path = `/user/following?user_id=${userId}&limit=100`;
      if (cursor) {
        path += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const responseData = await makeRequest(path);
      
      // Parse the following entries from this page
      const followingList = parseFollowingEntries(responseData);
      totalChecked += followingList.length;
      
      console.log(`Page ${pageCount}: Found ${followingList.length} following accounts (total checked: ${totalChecked})`);

      // Check if target user is in this page
      const isFollowing = followingList.some(user =>
        user.rest_id === targetUserId || user.id === targetUserId
      );

      if (isFollowing) {
        console.log(`Found target user ${targetUserId} on page ${pageCount}! User ${userId} is following.`);
        return { isFollowing: true, data: responseData, fallback: false };
      }

      // Get cursor for next page
      const nextCursor = extractCursor(responseData);
      
      // If no more pages or cursor is the same as previous, break
      if (!nextCursor || nextCursor === cursor || followingList.length === 0) {
        console.log(`No more pages available. Total accounts checked: ${totalChecked}`);
        break;
      }

      cursor = nextCursor;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (pageCount >= maxPages) {
      console.log(`Reached maximum pages (${maxPages}). Total accounts checked: ${totalChecked}`);
    }

    console.log(`User ${userId} does not follow ${targetUserId} (checked ${totalChecked} accounts across ${pageCount} pages)`);
    return { isFollowing: false, data: null, fallback: false };

  } catch (error) {
    console.error('Error in checkTwitterFollowStatus:', error);
    
    // Return fallback success to avoid blocking user experience
    if (error.message.includes('403')) {
      console.warn('RapidAPI access denied (403) - check API key and subscription. Using fallback verification.');
      return { isFollowing: true, data: null, fallback: true, reason: 'access_denied' };
    }
    
    if (error.message.includes('429')) {
      console.warn('RapidAPI rate limited (429) - too many requests. Using fallback verification.');
      return { isFollowing: true, data: null, fallback: true, reason: 'rate_limited' };
    }
    
    return { isFollowing: true, error: error.message, fallback: true };
  }
}

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text.replace(/\s+/g, ' ').replace(/[\u2019']/g, "'").trim().toLowerCase();
}

/**
 * Remove URLs from text for better comparison
 */
function removeUrls(text) {
  return text
    .replace(/https?:\/\/[^\s]+/g, '')  // Remove http/https URLs
    .replace(/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')  // Remove domain names
    .replace(/\s+/g, ' ')  // Clean up extra spaces
    .trim();
}

/**
 * Extract retweets from API response
 */
function extractRetweets(responseData, contentToCheck, targetUserId = null) {
  const requestId = `extract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  console.log(`[RETWEET_EXTRACT][${requestId}] Starting retweet extraction...`);
  console.log(`[RETWEET_EXTRACT][${requestId}] Content to check: "${contentToCheck}"`);
  if (targetUserId) {
    console.log(`[RETWEET_EXTRACT][${requestId}] Target user ID: ${targetUserId}`);
  }
  
  const normalizedContent = normalizeText(contentToCheck);
  const contentWithoutUrls = removeUrls(normalizedContent);
  
  console.log(`[RETWEET_EXTRACT][${requestId}] Normalized content: "${normalizedContent}"`);
  console.log(`[RETWEET_EXTRACT][${requestId}] Content without URLs: "${contentWithoutUrls}"`);
  
  try {
    if (responseData?.data?.user?.result?.timeline?.timeline?.instructions) {
      const instructions = responseData.data.user.result.timeline.timeline.instructions;
      console.log(`[RETWEET_EXTRACT][${requestId}] Found ${instructions.length} instructions`);
      
      const addEntriesInstruction = instructions.find(inst => inst.type === 'TimelineAddEntries');
      if (addEntriesInstruction && addEntriesInstruction.entries) {
        console.log(`[RETWEET_EXTRACT][${requestId}] Found ${addEntriesInstruction.entries.length} entries`);
        
        // Limit processing to first 20 entries to improve performance
        const entriesToProcess = Math.min(addEntriesInstruction.entries.length, 20);
        console.log(`[RETWEET_EXTRACT][${requestId}] Processing first ${entriesToProcess} entries (limited from ${addEntriesInstruction.entries.length})`);
        
        for (let i = 0; i < entriesToProcess; i++) {
          const entry = addEntriesInstruction.entries[i];
          console.log(`[RETWEET_EXTRACT][${requestId}] Processing entry ${i + 1}/${entriesToProcess}`);
          
          if (
            entry.content?.entryType === 'TimelineTimelineItem' &&
            entry.content?.itemContent?.itemType === 'TimelineTweet'
          ) {
            const tweetResult = entry.content.itemContent.tweet_results?.result;
            if (tweetResult && tweetResult.__typename === 'Tweet') {
              const legacy = tweetResult.legacy;
              
              console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ${i + 1} analysis:`, {
                id: legacy?.id_str,
                full_text_length: legacy?.full_text?.length || 0,
                full_text_preview: legacy?.full_text?.substring(0, 100) + '...',
                retweeted_status_id_str: legacy?.retweeted_status_id_str,
                hasRetweetedStatusResult: !!tweetResult.retweeted_status_result,
                isQuoteStatus: legacy?.is_quote_status,
                conversation_id_str: legacy?.conversation_id_str,
                user_id_str: legacy?.user_id_str,
              });
              
              if (legacy) {
                let isMatch = false;
                let matchType = '';
                
                // Check 1: Regular retweet (starts with "RT @")
                if (legacy.full_text && legacy.full_text.startsWith('RT @')) {
                  console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ${i + 1}: Regular retweet detected`);
                  
                  // If we have a target user ID, check if this retweet is from that user
                  if (targetUserId && legacy.retweeted_status_id_str) {
                    // Check if the retweeted status is from our target user
                    if (legacy.retweeted_status_id_str === targetUserId) {
                      console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ${i + 1}: ✅ Retweet from target user ID ${targetUserId} found!`);
                      isMatch = true;
                      matchType = 'target_user_retweet';
                    }
                  } else {
                    // Fallback to content matching if no target user ID
                    const normalizedTweet = normalizeText(legacy.full_text);
                    const tweetWithoutUrls = removeUrls(normalizedTweet);
                    
                    if (normalizedTweet.includes(normalizedContent) || tweetWithoutUrls.includes(contentWithoutUrls)) {
                      isMatch = true;
                      matchType = 'regular_retweet';
                    }
                  }
                }
                
                // Check 2: Retweet with retweeted_status_result
                if (!isMatch && tweetResult.retweeted_status_result) {
                  console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ${i + 1}: Retweet with retweeted_status_result detected`);
                  const retweetedStatus = tweetResult.retweeted_status_result.result;
                  if (retweetedStatus && retweetedStatus.legacy) {
                    const retweetedText = retweetedStatus.legacy.full_text;
                    if (retweetedText) {
                      const normalizedRetweeted = normalizeText(retweetedText);
                      const retweetedWithoutUrls = removeUrls(normalizedRetweeted);
                      
                      console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ${i + 1}: Checking retweeted content: "${retweetedText.substring(0, 100)}..."`);
                      
                      if (normalizedRetweeted.includes(normalizedContent) || retweetedWithoutUrls.includes(contentWithoutUrls)) {
                        isMatch = true;
                        matchType = 'retweet_with_status';
                      }
                    }
                  }
                }
                
                // Check 3: Quote tweet
                if (!isMatch && legacy.is_quote_status && legacy.quoted_status_id_str) {
                  console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ${i + 1}: Quote tweet detected`);
                  // For quote tweets, check both the quote text and the original tweet text
                  const normalizedTweet = normalizeText(legacy.full_text);
                  const tweetWithoutUrls = removeUrls(normalizedTweet);
                  
                  if (normalizedTweet.includes(normalizedContent) || tweetWithoutUrls.includes(contentWithoutUrls)) {
                    isMatch = true;
                    matchType = 'quote_tweet';
                  }
                }
                
                // Check 4: Regular tweet content match (fallback)
                if (!isMatch && legacy.full_text) {
                  const normalizedTweet = normalizeText(legacy.full_text);
                  const tweetWithoutUrls = removeUrls(normalizedTweet);
                  
                  if (normalizedTweet.includes(normalizedContent) || tweetWithoutUrls.includes(contentWithoutUrls)) {
                    // Additional check: if it contains the content but doesn't look like a retweet, 
                    // it might be a retweet that we missed
                    const contentWords = contentWithoutUrls.split(' ').filter(word => word.length > 2);
                    const tweetWords = tweetWithoutUrls.split(' ').filter(word => word.length > 2);
                    const matchingWords = contentWords.filter(word => tweetWithoutUrls.includes(word));
                    const similarityScore = matchingWords.length / contentWords.length;
                    
                    if (similarityScore >= 0.8) {
                      isMatch = true;
                      matchType = 'content_match';
                    }
                  }
                }
                
                if (isMatch) {
                  console.log(`[RETWEET_EXTRACT][${requestId}] ✅ RETWEET MATCH FOUND! Tweet ${i + 1}`);
                  console.log(`[RETWEET_EXTRACT][${requestId}] Match type: ${matchType}`);
                  console.log(`[RETWEET_EXTRACT][${requestId}] Tweet ID: ${legacy.id_str}`);
                  console.log(`[RETWEET_EXTRACT][${requestId}] Tweet text: "${legacy.full_text}"`);
                  
                  return {
                    ...legacy,
                    matchType: matchType,
                    retweetedStatusResult: tweetResult.retweeted_status_result || null
                  };
                } else {
                  console.log(`[RETWEET_EXTRACT][${requestId}] ❌ No match in tweet ${i + 1}`);
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`[RETWEET_EXTRACT][${requestId}] Error extracting retweets:`, error);
  }
  
  console.log(`[RETWEET_EXTRACT][${requestId}] ❌ No matching retweet found`);
  return null;
}

/**
 * Check if user has retweeted specific content with polling
 */
export async function checkTwitterPostStatus(userId, contentToCheck, targetUserId = null, maxAttempts = 20) {
  const requestId = `retweet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[RETWEET_CHECK][${requestId}] === NEW RETWEET CHECK REQUEST ===`);
  console.log(`[RETWEET_CHECK][${requestId}] User ID: ${userId}`);
  console.log(`[RETWEET_CHECK][${requestId}] Content to check: "${contentToCheck}"`);
  console.log(`[RETWEET_CHECK][${requestId}] Max attempts: ${maxAttempts}`);
  
  let attempt = 0;
  
  const checkForRetweet = async () => {
    attempt++;
    console.log(`[RETWEET_CHECK][${requestId}] Attempt ${attempt}/${maxAttempts}`);
    
    try {
      // Use single endpoint to get user's tweets and replies (includes retweets)
      const endpoint = `/user/tweetsandreplies?user_id=${userId}&limit=50`;
      console.log(`[RETWEET_CHECK][${requestId}] Checking endpoint: ${endpoint}`);
      
      const responseData = await makeRequest(endpoint);
      
      if (!responseData) {
        console.log(`[RETWEET_CHECK][${requestId}] Failed: no response data`);
        return { hasPosted: false, attempt: attempt };
      }
      
      console.log(`[RETWEET_CHECK][${requestId}] Endpoint successful, extracting retweets...`);
      const matchingRetweet = extractRetweets(responseData, contentToCheck, targetUserId);
      
      if (matchingRetweet) {
        console.log(`[RETWEET_CHECK][${requestId}] ✅ Found matching retweet!`);
        return {
          hasPosted: true,
          data: matchingRetweet,
          fallback: false,
          attempt: attempt,
          matchType: matchingRetweet.matchType,
          tweetId: matchingRetweet.id_str
        };
      }
      
      console.log(`[RETWEET_CHECK][${requestId}] ❌ No matching retweet found`);
      return { hasPosted: false, attempt: attempt };
      
    } catch (error) {
      console.error(`[RETWEET_CHECK][${requestId}] Error on attempt ${attempt}:`, error);
      
      // Return fallback success to avoid blocking user experience
      if (error.message.includes('403')) {
        console.warn(`[RETWEET_CHECK][${requestId}] RapidAPI access denied (403) - check API key and subscription. Using fallback verification.`);
        return { hasPosted: true, data: null, fallback: true, reason: 'access_denied', attempt: attempt };
      }
      
      if (error.message.includes('429')) {
        console.warn(`[RETWEET_CHECK][${requestId}] RapidAPI rate limited (429) - too many requests. Using fallback verification.`);
        return { hasPosted: true, data: null, fallback: true, reason: 'rate_limited', attempt: attempt };
      }
      
      return { hasPosted: true, error: error.message, fallback: true, attempt: attempt };
    }
  };
  
  // Initial check
  let result = await checkForRetweet();
  
  // If not found and we haven't reached max attempts, start polling
  if (!result.hasPosted && attempt < maxAttempts) {
    console.log(`[RETWEET_CHECK][${requestId}] Starting polling every 3 seconds...`);
    
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        result = await checkForRetweet();
        
        if (result.hasPosted || attempt >= maxAttempts) {
          clearInterval(interval);
          console.log(`[RETWEET_CHECK][${requestId}] Polling completed. Final result:`, {
            hasPosted: result.hasPosted,
            attempt: attempt,
            matchType: result.matchType || null
          });
          console.log(`[RETWEET_CHECK][${requestId}] === REQUEST COMPLETED ===`);
          resolve(result);
        }
      }, 3000); // Check every 3 seconds
    });
  }
  
  console.log(`[RETWEET_CHECK][${requestId}] Final result:`, {
    hasPosted: result.hasPosted,
    attempt: attempt,
    matchType: result.matchType || null
  });
  console.log(`[RETWEET_CHECK][${requestId}] === REQUEST COMPLETED ===`);
  
  return result;
}

/**
 * Check custom username availability
 */
export async function checkCustomUsernameAvailability(userId) {
  try {
    console.log(`Checking user details for user ID ${userId}...`);
    
    // Use the "User By User ID" endpoint to check if user exists
    const responseData = await makeRequest(`/user/details?user_id=${userId}`);
    
    console.log('Username check result:', responseData);
    
    // Handle the new nested response format
    const displayName = responseData?.data?.user?.result?.legacy?.name;
    const username = responseData?.data?.user?.result?.legacy?.screen_name;
    const verified = responseData?.data?.user?.result?.legacy?.verified;
    const followersCount = responseData?.data?.user?.result?.legacy?.followers_count;
    const description = responseData?.data?.user?.result?.legacy?.description;
    
    // If we get user data, the username exists and is taken
    return { 
      exists: true, 
      available: false, 
      data: responseData,
      fallback: false,
      userInfo: {
        name: displayName,
        username: username,
        verified: verified,
        followers: followersCount,
        description: description
      }
    };
  } catch (error) {
    console.error('Error checking username availability:', error);
    
    if (error.message.includes('404')) {
      // Username not found - it's available
      console.log(`Username ${userId} not found - available`);
      return { exists: false, available: true, fallback: false };
    }
    
    if (error.message.includes('403')) {
      console.warn('RapidAPI access denied (403) for username check - check API key and subscription. Using fallback verification.');
      return { exists: true, available: false, data: null, fallback: true, reason: 'access_denied' };
    }
    
    if (error.message.includes('429')) {
      console.warn('RapidAPI rate limited (429) for username check - too many requests. Using fallback verification.');
      return { exists: true, available: false, data: null, fallback: true, reason: 'rate_limited' };
    }
    
    // Return fallback success to avoid blocking user experience
    return { exists: true, available: false, error: error.message, fallback: true };
  }
}

/**
 * Check if user's display name contains specific character sequences
 * @param {string} userId - Twitter user ID
 * @param {string|Array} sequences - Character sequence(s) to check for
 * @returns {Object} - Result with verification status and details
 */
export async function checkDisplayNameSequences(userId, sequences = ['abc']) {
  try {
    console.log(`Checking display name sequences for user ID ${userId}...`);
    console.log(`Sequences to check:`, sequences);
    
    // Use the "User By User ID" endpoint to get user details
    const responseData = await makeRequest(`/user/details?user_id=${userId}`);
    
    console.log('Display name check result:', responseData);
    
    // Handle the new nested response format
    const displayName = responseData?.data?.user?.result?.legacy?.name;
    const username = responseData?.data?.user?.result?.legacy?.screen_name;
    const verified = responseData?.data?.user?.result?.legacy?.verified;
    const followersCount = responseData?.data?.user?.result?.legacy?.followers_count;
    const description = responseData?.data?.user?.result?.legacy?.description;
    
    if (!displayName) {
      console.warn('No display name found in response');
      return { 
        verified: false, 
        data: responseData,
        fallback: false,
        reason: 'no_display_name',
        displayName: null,
        sequencesFound: []
      };
    }
    const normalizedDisplayName = displayName.toLowerCase();
    
    // Convert sequences to array if it's a string
    const sequencesArray = Array.isArray(sequences) ? sequences : [sequences];
    
    // Check which sequences are found in the display name
    const sequencesFound = sequencesArray.filter(sequence => 
      normalizedDisplayName.includes(sequence.toLowerCase())
    );
    
    const isVerified = sequencesFound.length > 0;
    
    console.log(`Display name: "${displayName}"`);
    console.log(`Sequences found:`, sequencesFound);
    console.log(`Verification result:`, isVerified);
    
    return { 
      verified: isVerified, 
      data: responseData,
      fallback: false,
      displayName: displayName,
      sequencesFound: sequencesFound,
      allSequences: sequencesArray,
      userInfo: {
        name: displayName,
        username: username,
        verified: verified,
        followers: followersCount,
        description: description
      }
    };
    
  } catch (error) {
    console.error('Error checking display name sequences:', error);
    
    if (error.message.includes('404')) {
      console.log(`User ${userId} not found`);
      return { 
        verified: false, 
        data: null, 
        fallback: false, 
        reason: 'user_not_found' 
      };
    }
    
    if (error.message.includes('403')) {
      console.warn('RapidAPI access denied (403) for display name check - check API key and subscription. Using fallback verification.');
      return { 
        verified: true, 
        data: null, 
        fallback: true, 
        reason: 'access_denied' 
      };
    }
    
    if (error.message.includes('429')) {
      console.warn('RapidAPI rate limited (429) for display name check - too many requests. Using fallback verification.');
      return { 
        verified: true, 
        data: null, 
        fallback: true, 
        reason: 'rate_limited' 
      };
    }
    
    // Return fallback success to avoid blocking user experience
    return { 
      verified: true, 
      error: error.message, 
      fallback: true 
    };
  }
}

/**
 * Test API access function
 */
export async function testRapidAPIAccess() {
  try {
    console.log('Testing RapidAPI access with new key...');
    
    // Test with a known account to verify API access
    const responseData = await makeRequest('/user/details?username=twitter');
    
    console.log('API Test Success:', responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error('API Test Error:', error);
    
    if (error.message.includes('429')) {
      console.warn('API Test Rate Limited (429) - this is normal for new keys');
      return { success: false, status: 429, statusText: 'Too Many Requests', rateLimited: true };
    } else if (error.message.includes('403')) {
      console.warn('API Test Forbidden (403) - check API key and subscription');
      return { success: false, status: 403, statusText: 'Forbidden', accessDenied: true };
    } else {
      console.error('API Test Failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}
