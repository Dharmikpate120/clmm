'use client'

import { useState, ChangeEvent } from 'react'
// import DashboardFeature from '@/features/dashboard/dashboard-feature'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

import addLiquidity from '@/lib/actions/addLiquidity'
import withdrawLiquidity from '@/lib/actions/withdrawLiquidity'
import { AmmAccountData, AmmAddLiquidity, AmmWithdrawLiquidity, SwapTokens } from '@/lib/types'
import swapTokens from '@/lib/actions/swapTokens'
import { useSignAndSendTransaction, useWalletUi, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiGill, useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { getTransactionEncoder } from 'gill'
import DashboardFeature from '@/features/dashboard/dashboard-feature'
import SubHeader from '@/components/home/SubHeader'
import SummaryCards from '@/components/home/SummaryCards'
import PoolList from '@/components/home/PoolList'

export default function Home() {
  const { connected } = useWalletUi()
  return connected ? <ConnectedComponent /> : <DashboardFeature />


}
export const maxDuration = 200;
function ConnectedComponent() {
  const walletUi = useWalletUi()
  const client = useWalletUiGill()

  const signer = useWalletUiSigner({ account: walletUi.account! });
  const sender = useWalletUiSignAndSend();

  /* Create Market logic moved to /admin */

  const [addLiquidityData, setAddLiquidityData] = useState({
    token_a_mint_account: '6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd',
    token_b_mint_account: 'DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP',
    provider_token_a_account: 'cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt',
    provider_token_b_account: 'ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn',
    amount_a_max: '100',
    amount_b_max: '100',
    minimum_lp_tokens: '1',
  })

  const [withdrawLiquidityData, setWithdrawLiquidityData] = useState({
    token_a_mint_account: '6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd',
    token_b_mint_account: 'DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP',
    provider_token_a_account: 'cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt',
    provider_token_b_account: 'ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn',
    amount_a_min: '100',
    amount_b_min: '100',
    maximum_lp_tokens: '100000',
  })
  // amm_token_a_pool_account 8HQanjD9QxL2dDC3aSZMW6VoyeRkZTK43wKpzhEwhExJ 6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd BngwetXKv5uZVHAdta3SoY2n7BNqdtMPHUH4doiRR6tT
  // amm_token_b_pool_account 8HQanjD9QxL2dDC3aSZMW6VoyeRkZTK43wKpzhEwhExJ DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP AkZGSWn8wZqwPQ5uuaUpvVDBSHf2b7RimiqrFUYWjYRd  
  const [swapTokensData, setSwapTokensData] = useState({
    swapper_token_a_account: 'cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt',
    swapper_token_b_account: 'ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn',
    // swapper_token_a_account: 'ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn',
    // swapper_token_b_account: 'cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt',

    token_a_mint_account: '6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd',
    token_b_mint_account: 'DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP',
    // token_a_mint_account: 'DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP',
    // token_b_mint_account: '6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd',

    max_amount_in: '10000',
    minimum_amount_out: '1',
  })

  const [error, setError] = useState<string | null>(null)

  const handleAddLiquidityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setAddLiquidityData((prev) => ({ ...prev, [id]: value }))
  }

  const handleWithdrawLiquidityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setWithdrawLiquidityData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSwapTokensChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSwapTokensData((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddLiquidity = async () => {
    const isAnyFieldEmpty = Object.values(addLiquidityData).some((value) => value === '')
    if (isAnyFieldEmpty) {
      const errorMessage = 'All fields are required. Please fill in all the details.'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }
    if (!walletUi.account) {
      setError("Wallet not connected!");
      toast.error("Wallet not connected!");
      return;
    }
    setError(null)
    const instruction = await addLiquidity({ ...addLiquidityData, provider_account: walletUi.account.address });
    if (!walletUi.account || !instruction) {
      return;
    }
    const result = await sender([instruction!], signer);
    console.log(result);

  }

  const handleWithdrawLiquidity = async () => {
    const isAnyFieldEmpty = Object.values(withdrawLiquidityData).some((value) => value === '')
    if (isAnyFieldEmpty) {
      const errorMessage = 'All fields are required. Please fill in all the details.'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }
    if (!walletUi.account) {
      setError("Wallet not connected!");
      toast.error("Wallet not connected!");
      return;
    }
    setError(null)
    const instruction = await withdrawLiquidity({ ...withdrawLiquidityData, provider_account: walletUi.account.address });
    if (!walletUi.account || !instruction) {
      return;
    }
    const result = await sender([instruction!], signer);
    console.log(result);
  }

  const handleSwapTokens = async () => {
    const isAnyFieldEmpty = Object.values(swapTokensData).some((value) => value === '')
    if (isAnyFieldEmpty) {
      const errorMessage = 'All fields are required. Please fill in all the details.'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }
    if (!walletUi.account) {
      setError("Wallet not connected!");
      toast.error("Wallet not connected!");
      return;
    }
    setError(null)
    const instruction = await swapTokens({ ...swapTokensData, swapper_account: walletUi.account.address });

    if (!walletUi.account || !instruction) {
      return;
    }
    const result = await sender([instruction!], signer);
    console.log(result);
    // getTransactionEncoder(transaction)

    // signer.signAndSendTransactions(transaction)
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <SubHeader />
      <SummaryCards />
      <PoolList />
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Prices updated: </span>
          <span className="font-mono">14s ago</span>
        </div>
      </div>
    </main>
  )
}
