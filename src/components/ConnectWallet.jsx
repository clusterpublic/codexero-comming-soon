import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
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

async function upsertWalletConnectionIfExists(normalizedAddress) {
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

  const afterConnect = () => {
    if (!address) return
    const normalized = address.toLowerCase()
    upsertWalletConnectionIfExists(normalized).finally(() => {
      navigate('/mint-nft')
    })
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


