import { useState, useEffect } from 'react'
import Image from 'next/image'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { SwapTokens, TickData } from '@/lib/types'
import swapTokens from '@/lib/actions/swapTokens'
import { Market } from '@/lib/types/market'
import { useWalletUi, useWalletUiSigner, useWalletUiWallet, UiWallet } from '@wallet-ui/react'
import { TokenAccount } from '@/lib/types/position'
import { simulateSwap, simulateSwapInverse } from '@/lib/math/swap'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'

const DUMMY_ICON =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'

const WalletConnectButton = ({ wallets }: { wallets: UiWallet[] }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
          <AccountBalanceWalletIcon fontSize="small" />
          Connect Wallet
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border">
        {wallets.length ? (
          wallets.map((wallet) => <WalletItem key={wallet.name} wallet={wallet} />)
        ) : (
          <DropdownMenuItem className="text-muted-foreground p-3 text-center">No wallets found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const WalletItem = ({ wallet }: { wallet: UiWallet }) => {
  const { connect } = useWalletUiWallet({ wallet })
  return (
    <DropdownMenuItem
      className="cursor-pointer flex items-center gap-3 p-3 hover:bg-muted rounded-lg"
      onClick={() => connect()}
    >
    <div className="w-6 h-6 rounded-md relative overflow-hidden">
        <Image src={wallet.icon} alt={wallet.name} fill className="object-cover" />
    </div>
      <span className="font-medium">{wallet.name}</span>
    </DropdownMenuItem>
  )
}

export default function SwapCard({ market, ticks }: { market: Market; ticks: TickData[] }) {
  const { account, connected, wallets } = useWalletUi()
  const signer = useWalletUiSigner({ account: account! })
  const sender = useWalletUiSignAndSend()
  const [isSwapped, setIsSwapped] = useState(false)
  const [userTokenAccounts, setUserTokenAccounts] = useState<TokenAccount[]>([])
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [estimatedPrice, setEstimatedPrice] = useState<number>(market.current_price)

  const [swapFormData, setSwapFormData] = useState<SwapTokens>({
    token_a_mint_account: market.mint_address_a,
    token_b_mint_account: market.mint_address_b,
    swapper_token_a_account: '',
    swapper_token_b_account: '',
    token_in_mint: market.mint_address_a,
    token_out_mint: market.mint_address_b,
    max_amount_in: '1',
    minimum_amount_out: '20',
    swapper_account: account?.address || '',
    ticks,
  })

  // Fetch swapper accounts automatically
  useEffect(() => {
    if (!account?.address) return

    const fetchAccounts = async () => {
      try {
        // Fetching accounts for both mints
        const res = await fetch(`/api/user/token-accounts?user_address=${account.address}`)
        const data = await res.json()
        const accounts: TokenAccount[] = data.tokenAccounts || []
        setUserTokenAccounts(accounts)

        const accA = accounts.find((a) => a.token_mint_address === market.mint_address_a)
        const accB = accounts.find((a) => a.token_mint_address === market.mint_address_b)

        setSwapFormData((prev) => ({
          ...prev,
          swapper_token_a_account: accA?.token_address || '',
          swapper_token_b_account: accB?.token_address || '',
          swapper_account: account.address,
        }))
      } catch (err) {
        console.error('Failed to fetch swapper accounts:', err)
      }
    }

    fetchAccounts()
  }, [account?.address, market.mint_address_a, market.mint_address_b])

  const handleSwapDirection = () => {
    setIsSwapped(!isSwapped)
    setSwapFormData((prev) => ({
      ...prev,
      token_in_mint: isSwapped ? market.mint_address_a : market.mint_address_b,
      token_out_mint: isSwapped ? market.mint_address_b : market.mint_address_a,
    }))
  }

  const handleInputChange = (value: string, field: keyof SwapTokens) => {
    setSwapFormData((prevState) => {
      const newState = { ...prevState, [field]: value }

      const numValue = parseFloat(value) || 0
      if (numValue <= 0) {
        if (field === 'max_amount_in') newState.minimum_amount_out = ''
        else if (field === 'minimum_amount_out') newState.max_amount_in = ''
        setPriceImpact(0)
        return newState
      }

      const isTokenAIn = !isSwapped

      if (field === 'max_amount_in') {
        const result = simulateSwap(numValue, isTokenAIn, market.current_price, market.active_liquidity, ticks)
        newState.minimum_amount_out = result.amountOut.toFixed(6)
        setPriceImpact(result.priceImpact)
        setEstimatedPrice(result.finalPrice)
      } else if (field === 'minimum_amount_out') {
        const result = simulateSwapInverse(numValue, isTokenAIn, market.current_price, market.active_liquidity, ticks)
        newState.max_amount_in = result.remainingIn.toFixed(6)
        setPriceImpact(result.priceImpact)
        setEstimatedPrice(result.finalPrice)
      }

      return newState
    })
  }

  const handleSwap = async () => {
    if (!connected) return
    const instruction = await swapTokens(swapFormData)

    const result = sender(instruction!, signer)
    console.log('Swap result:', result)
  }

  const tokenInMint = isSwapped ? market.mint_address_b : market.mint_address_a
  const tokenOutMint = isSwapped ? market.mint_address_a : market.mint_address_b

  const balanceIn = userTokenAccounts.find((a) => a.token_mint_address === tokenInMint)?.balance || '0.00'
  const balanceOut = userTokenAccounts.find((a) => a.token_mint_address === tokenOutMint)?.balance || '0.00'

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-muted/70 rounded-lg">
          <span className="px-4 py-1.5 rounded-md text-sm font-medium text-foreground transition-all">Swap</span>
          {/* <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
            Limit
          </button> */}
        </div>
        {/* <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer">
          <SettingsIcon fontSize="small" />
        </button> */}
      </div>

      <div className="space-y-4">
        {/* You Pay Section */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border group hover:border-primary/50 transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">You Pay</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              Balance: <span className="text-foreground font-medium">{balanceIn}</span>
              <button
                onClick={() => handleInputChange(balanceIn, 'max_amount_in')}
                className="text-primary text-[10px] font-bold uppercase cursor-pointer hover:underline"
              >
                Max
              </button>
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              className="bg-transparent text-3xl font-bold text-foreground focus:outline-none w-full placeholder:text-muted-foreground/30"
              placeholder="0.00"
              type="text"
              value={swapFormData.max_amount_in}
              onChange={(e) => handleInputChange(e.target.value, 'max_amount_in')}
            />
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 shrink-0 shadow-sm">
            <div className="w-6 h-6 rounded-full relative overflow-hidden shrink-0">
              <Image alt="Token In" fill src={DUMMY_ICON} className="object-cover" />
            </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground leading-none">
                  {isSwapped ? 'Token B' : 'Token A'}
                </span>
                <span className="text-[8px] text-muted-foreground font-mono truncate w-16">{tokenInMint}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Switch */}
        <div className="flex justify-center -my-4 relative z-10">
          <button
            onClick={handleSwapDirection}
            className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <SwapVertIcon fontSize="small" />
          </button>
        </div>

        {/* You Receive Section */}
        <div className="bg-muted/30 rounded-xl p-4 border border-border group hover:border-primary/50 transition-all">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-tight">You Receive</span>
            <span className="text-xs text-muted-foreground">
              Balance: <span className="text-foreground font-medium">{balanceOut}</span>
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              className="bg-transparent text-3xl font-bold text-foreground focus:outline-none w-full placeholder:text-muted-foreground/30"
              placeholder="0.00"
              type="text"
              value={swapFormData.minimum_amount_out}
              onChange={(e) => handleInputChange(e.target.value, 'minimum_amount_out')}
            />
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 shrink-0 shadow-sm">
            <div className="w-6 h-6 rounded-full relative overflow-hidden shrink-0">
              <Image alt="Token Out" fill src={DUMMY_ICON} className="object-cover" />
            </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground leading-none">
                  {isSwapped ? 'Token A' : 'Token B'}
                </span>
                <span className="text-[8px] text-muted-foreground font-mono truncate w-16">{tokenOutMint}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Info */}
        {(parseFloat(swapFormData.max_amount_in) > 0 || parseFloat(swapFormData.minimum_amount_out) > 0) && (
          <div className="px-1 py-1 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <span>Price Impact</span>
              <span
                className={cn(
                  priceImpact > 5 ? 'text-destructive' : priceImpact > 1 ? 'text-yellow-500' : 'text-green-500',
                )}
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <span>Est. Price</span>
              <span className="text-foreground">
                1 {isSwapped ? 'Token B' : 'Token A'} = {estimatedPrice.toFixed(6)} {isSwapped ? 'Token A' : 'Token B'}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {connected ? (
          <button
            onClick={handleSwap}
            className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold py-4 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            Swap Tokens
          </button>
        ) : (
          <WalletConnectButton wallets={wallets} />
        )}
      </div>
    </div>
  )
}
