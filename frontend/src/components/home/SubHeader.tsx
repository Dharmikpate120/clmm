'use client'

import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'
import { useTheme as useNextTheme } from 'next-themes'
import initializeAmmAccount from '@/lib/actions/initializeAmmAccount'
import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import type { PoolListFilters } from '@/components/home/PoolList'

const initialState = {
  /* 
 spl-token create-token --decimals 0
 */
  token_a_mint_account: 'GQFLMUdzy8sCjfg63W9JQWY1fP91sLvprwvZ7nuwriTh',
  token_b_mint_account: '3pm8ZVVLyrv12uWniKP9zipTRgFGRD1HYsnngdk983Lm',
  /* 
spl-token create-account 3pm8ZVVLyrv12uWniKP9zipTRgFGRD1HYsnngdk983Lm
spl-token mint 3pm8ZVVLyrv12uWniKP9zipTRgFGRD1HYsnngdk983Lm 200000 -- HNgNHWPezKiUtv9zdD1zSRiqyZJt99nt56EaxU7LeAX8
*/
  admin_token_a_account: 'FvwCPiRmfHoRWmQ4nX6ywRa3x2g7PgisbGwyY33xE6uU',
  admin_token_b_account: 'HNgNHWPezKiUtv9zdD1zSRiqyZJt99nt56EaxU7LeAX8',
  token_a_amount: '100000',
  token_b_amount: '10000',
  start_tick: '22000',
  end_tick: '34000',
  admin_account: '',
  nft_signer: '',
}

interface SubHeaderProps {
  filters: PoolListFilters
  onFiltersChange: (filters: PoolListFilters) => void
}

export default function SubHeader({ filters, onFiltersChange }: SubHeaderProps) {
  // const { signTransaction } = useWallet();
  const walletUi = useWalletUi()
  const signer = useWalletUiSigner({ account: walletUi.account! })
  const sender = useWalletUiSignAndSend()
  const { resolvedTheme } = useNextTheme()

  const [openModal, setOpenModal] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const [formData, setFormData] = useState(initialState)
  // local filter draft (applied on "Apply")
  const [filterDraft, setFilterDraft] = useState({
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minLiquidity: filters.minLiquidity,
    maxLiquidity: filters.maxLiquidity,
  })

  const isDark = resolvedTheme === 'dark'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreatePool = async () => {
    // const nft_signer = await generateKeyPairSigner()
    const currentData = {
      ...formData,
      admin_account: signer.address.toString(),
      // nft_signer: nft_signer.address.toString()
    }
    const instruction = await initializeAmmAccount(currentData)
    // console.log(instruction);
    // if (!signTransaction){
    //   throw Error("Please connect your wallet")
    // }
    // const transactionCodec = getTransactionCodec();
    // const deserializedTx = transactionCodec.decode(partiallySignedTx!)

    // const fullySignedTx = await signTransaction(deserializedTx,
    //   [signer]
    // )

    // const wireTxBytes = getBase64EncodedWireTransaction(deserializedTx);

    // const wireBytes = Buffer.from(wireTxBytes, 'base64');
    // const v1Transaction = VersionedTransaction.deserialize(wireBytes);
    // console.log(v1Transaction);
    // const signedTx = await signTransaction(v1Transaction);
    // console.log(signedTx);

    // instruction?.accounts[1].signer = nft_signer;
    // const transaction = await createTransaction({
    //   instructions: [instruction!],
    //   feePayer: address(formData.admin_account)
    // });

    // const compiledTx = compileTransaction(transaction);
    // const partiallySignedTx = await signTransaction([nft_signer.keyPair], transaction!);

    // await signer.signAndSendTransactions([deserializedTx]);
    const result = await sender(instruction!, signer)

    console.log(result)
    setOpenModal(false)

    setFormData(initialState)
  }

  const handleSearch = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value })
    },
    [filters, onFiltersChange],
  )

  const handleApplyFilters = () => {
    onFiltersChange({ ...filters, ...filterDraft })
    setOpenFilter(false)
  }

  const handleClearFilters = () => {
    const cleared = { minPrice: '', maxPrice: '', minLiquidity: '', maxLiquidity: '' }
    setFilterDraft(cleared)
    onFiltersChange({ ...filters, ...cleared })
    setOpenFilter(false)
  }

  const activeFilterCount = [filters.minPrice, filters.maxPrice, filters.minLiquidity, filters.maxLiquidity].filter(
    Boolean,
  ).length

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: isDark ? '#ffffff' : '#000000',
      backgroundColor: isDark ? '#09090b' : '#ffffff',
      '& fieldset': { borderColor: isDark ? '#27272a' : '#e4e4e7' },
      '&:hover fieldset': { borderColor: isDark ? '#3f3f46' : '#d4d4d8' },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
    },
    '& .MuiInputLabel-root': {
      color: isDark ? '#a1a1aa' : '#71717a',
      '&.Mui-focused': { color: '#3b82f6' },
    },
  }

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">CLMM Pools</h1>
        <p className="text-muted-foreground max-w-2xl">
          Provide concentrated liquidity to earn higher fees. View analytics and manage your positions across the Solana
          ecosystem.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400 group-focus-within:text-primary" />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-shadow shadow-sm"
            placeholder="Search address or mint…"
            type="text"
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Filter button */}
        <div className="relative">
          <button
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer"
            onClick={() => setOpenFilter(true)}
          >
            <FilterListIcon fontSize="small" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Create Pool */}
        {walletUi.account?.address === process.env.NEXT_PUBLIC_ADMIN_ACCOUNT && (
          <button
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer"
            onClick={() => setOpenModal(true)}
          >
            <AddIcon fontSize="small" />
            Create Pool
          </button>
        )}
      </div>

      {/* Filter panel */}
      <Dialog
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: isDark ? '#09090b' : '#ffffff', backgroundImage: 'none' },
        }}
      >
        <DialogTitle
          sx={{
            color: isDark ? '#ffffff' : '#000000',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Filter Markets
          <button
            onClick={() => setOpenFilter(false)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Price Range (sqrt price)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Min Price"
                value={filterDraft.minPrice}
                onChange={(e) => setFilterDraft((d) => ({ ...d, minPrice: e.target.value }))}
                size="small"
                type="number"
                sx={textFieldSx}
              />
              <TextField
                label="Max Price"
                value={filterDraft.maxPrice}
                onChange={(e) => setFilterDraft((d) => ({ ...d, maxPrice: e.target.value }))}
                size="small"
                type="number"
                sx={textFieldSx}
              />
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Liquidity Range</p>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Min Liquidity"
                value={filterDraft.minLiquidity}
                onChange={(e) => setFilterDraft((d) => ({ ...d, minLiquidity: e.target.value }))}
                size="small"
                type="number"
                sx={textFieldSx}
              />
              <TextField
                label="Max Liquidity"
                value={filterDraft.maxLiquidity}
                onChange={(e) => setFilterDraft((d) => ({ ...d, maxLiquidity: e.target.value }))}
                size="small"
                type="number"
                sx={textFieldSx}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px', gap: '8px' }}>
          <Button
            onClick={handleClearFilters}
            sx={{
              color: isDark ? '#a1a1aa' : '#71717a',
              textTransform: 'none',
              '&:hover': { backgroundColor: isDark ? '#27272a' : '#f4f4f5' },
            }}
          >
            Clear
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#2563eb' },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Pool modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: isDark ? '#09090b' : '#ffffff', backgroundImage: 'none' },
        }}
      >
        <DialogTitle sx={{ color: isDark ? '#ffffff' : '#000000', fontSize: '1.25rem', fontWeight: 600 }}>
          Create New Pool
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              ['Token A Mint Account', 'token_a_mint_account'],
              ['Token B Mint Account', 'token_b_mint_account'],
              ['Admin Token A Account', 'admin_token_a_account'],
              ['Admin Token B Account', 'admin_token_b_account'],
              ['Token A Amount', 'token_a_amount'],
              ['Token B Amount', 'token_b_amount'],
              ['Start Tick', 'start_tick'],
              ['End Tick', 'end_tick'],
            ].map(([label, name]) => (
              <TextField
                key={name}
                label={label}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                sx={textFieldSx}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{
              color: isDark ? '#a1a1aa' : '#71717a',
              textTransform: 'none',
              '&:hover': { backgroundColor: isDark ? '#27272a' : '#f4f4f5' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePool}
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { backgroundColor: '#2563eb' },
            }}
          >
            Create Pool
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
