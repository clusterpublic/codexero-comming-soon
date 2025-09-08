import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { UserProfileService } from '../services/userProfileService'
import { WagmiProvider, http, createConfig, useAccount } from 'wagmi'
import { RainbowKitProvider, darkTheme, getDefaultWallets, useConnectModal } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Import styles
import '@rainbow-me/rainbowkit/styles.css';

const seiTestnet = {
  id: 1328,
  name: 'Sei Testnet',
  network: 'sei-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SEI',
    symbol: 'SEI',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] },
  },
  blockExplorers: {
    default: { name: 'SeiTrace', url: 'https://seitrace.com/' },
  },
  testnet: true,
}

const projectId = '754e1248d36423203f38eac94cf22fa0'

const queryClient = new QueryClient()

function WalletProviders({ children }) {
  const { connectors } = getDefaultWallets({ appName: 'CodeXero dApp', projectId })

  const wagmiConfig = useMemo(() => (
    createConfig({
      chains: [seiTestnet],
      connectors,
      transports: {
        [seiTestnet.id]: http(),
      },
      syncConnectedChain: true,
    })
  ), [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

async function createOrUpdateUserProfile(normalizedAddress, userId) {
  try {
    // Check if user profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', selectError)
      return null
    }

    if (existingProfile) {
      // Update existing profile with new connection timestamp
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating existing profile:', updateError)
        return null
      }

      console.log('Updated existing user profile:', updatedProfile)
      return updatedProfile
    } else {
      // Create new user profile
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          wallet_address: normalizedAddress,
          wallet_connected_at: new Date().toISOString(),
          verification_metadata: {
            wallet_connection_source: 'web3_connect',
            user_agent: navigator.userAgent,
            connection_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating new profile:', insertError)
        return null
      }

      console.log('Created new user profile:', newProfile)
      return newProfile
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error)
    return null
  }

  // Also update waitlist if exists (backward compatibility)
  try {
    await upsertWaitlistConnection(normalizedAddress)
  } catch (error) {
    console.warn('Waitlist update failed (non-critical):', error)
  }
}

async function upsertWaitlistConnection(normalizedAddress) {
  // Try lower-case column first (matches current app usage)
  const { data: existingLower, error: selectLowerErr } = await supabase
    .from('waitlist_subscriptions')
    .select('id, walletaddress')
    .eq('walletaddress', normalizedAddress)
    .limit(1)
    .maybeSingle()

  if (selectLowerErr) {
    // Continue fallback to camelCase check
    // console.warn('Select lower-case walletaddress error:', selectLowerErr)
  }

  let targetId = existingLower?.id

  if (!targetId) {
    // Fallback: check camelCase column used in SQL script
    const { data: existingCamel } = await supabase
      .from('waitlist_subscriptions')
      .select('id, walletAddress')
      .eq('walletAddress', normalizedAddress)
      .limit(1)
      .maybeSingle()

    targetId = existingCamel?.id
  }

  if (targetId) {
    // Update status/timestamp without inserting new email (email is NOT NULL in schema)
    await supabase
      .from('waitlist_subscriptions')
      .update({ status: 'wallet_connected', updated_at: new Date().toISOString() })
      .eq('id', targetId)
  }
}

function ConnectWalletInner() {
  const { isConnected, address } = useAccount()
  const navigate = useNavigate()
  const { openConnectModal } = useConnectModal()
  const [shouldRedirectAfterConnect, setShouldRedirectAfterConnect] = useState(false)

  const afterConnect = async () => {
    if (!address) return
    
    try {
      const normalized = address.toLowerCase()
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      
      if (userId) {
        // Create or update user profile with wallet connection
        const userProfile = await UserProfileService.createOrUpdateProfile(normalized, userId, {
          connection_source: 'wagmi_wallet_connect',
          connection_timestamp: new Date().toISOString()
        })
        
        if (userProfile) {
          console.log('User profile created/updated successfully:', userProfile.id)
        } else {
          console.warn('Failed to create/update user profile, but continuing...')
        }
      } else {
        console.warn('No authenticated user found, creating anonymous wallet connection')
        // Still update waitlist for backward compatibility
        await upsertWaitlistConnection(normalized)
      }
      
      // Navigate to mint page
      navigate('/mint-nft')
    } catch (error) {
      console.error('Error in afterConnect:', error)
      // Still navigate even if profile creation fails
      navigate('/mint-nft')
    }
  }

  const handleMintClick = () => {
    if (isConnected && address) {
      afterConnect()
    } else {
      setShouldRedirectAfterConnect(true)
      if (openConnectModal) openConnectModal()
    }
  }

  useEffect(() => {
    if (shouldRedirectAfterConnect && isConnected && address) {
      afterConnect()
      setShouldRedirectAfterConnect(false)
    }
  }, [shouldRedirectAfterConnect, isConnected, address])

  return (
    <div>
      <button
        className="get-started-btn"
        onClick={handleMintClick}
        type="button"
      >
        Mint NFT
      </button>
    </div>
  )
}

export default function ConnectWallet() {
  return (
    <WalletProviders>
      <ConnectWalletInner />
    </WalletProviders>
  )
}