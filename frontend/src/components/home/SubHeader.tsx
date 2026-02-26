'use client'

import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, useTheme } from '@mui/material'
import { useTheme as useNextTheme } from 'next-themes'
import initializeAmmAccount from '@/lib/actions/initializeAmmAccount'
import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'

export default function SubHeader() {
  const walletUi = useWalletUi()
  //   const client = useWalletUiGill()

  const signer = useWalletUiSigner({ account: walletUi.account! })
  const sender = useWalletUiSignAndSend()
  const { resolvedTheme } = useNextTheme()

  const muiTheme = useTheme()
  const [openModal, setOpenModal] = useState(false)
  const [formData, setFormData] = useState({
    token_a_mint_account: '6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd',
    token_b_mint_account: 'DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP',
    admin_token_a_account: 'cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt',
    admin_token_b_account: 'ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn',
    token_a_amount: '100',
    token_b_amount: '100',
    start_tick: '22000',
    end_tick: '24000',
    admin_account: 'GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3',
  })

  const isDark = resolvedTheme === 'dark'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreatePool = async () => {
    // Handler function to process the form data
    const instruction = await initializeAmmAccount(formData)

    // const result = sender([instruction!], signer)
    // console.log('Creating pool with data:', result)
    // Add your logic here, e.g., API call or state update

    setOpenModal(false)
    // Reset form if needed
    setFormData({
      token_a_mint_account: '6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd',
      token_b_mint_account: 'DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP',
      admin_token_a_account: 'cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt',
      admin_token_b_account: 'ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn',
      token_a_amount: '100',
      token_b_amount: '100',
      start_tick: '22000',
      end_tick: '24000',
      admin_account: 'GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3',
    })
  }

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: isDark ? '#ffffff' : '#000000',
      backgroundColor: isDark ? '#09090b' : '#ffffff',
      '& fieldset': {
        borderColor: isDark ? '#27272a' : '#e4e4e7',
      },
      '&:hover fieldset': {
        borderColor: isDark ? '#3f3f46' : '#d4d4d8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
      },
    },
    '& .MuiInputLabel-root': {
      color: isDark ? '#a1a1aa' : '#71717a',
      '&.Mui-focused': {
        color: '#3b82f6',
      },
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
      <div className="flex gap-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-gray-400 group-focus-within:text-primary" />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-shadow shadow-sm"
            placeholder="Search tokens or pools..."
            type="text"
          />
        </div>
        <button className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 cursor-pointer">
          <FilterListIcon fontSize="small" />
          Filter
        </button>
        <button
          className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-glow-primary transition-all flex items-center gap-2 cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <AddIcon fontSize="small" />
          Create Pool
        </button>
      </div>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#09090b' : '#ffffff',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDark ? '#ffffff' : '#000000',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          Create New Pool
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField
              label="Token A Mint Account"
              name="token_a_mint_account"
              value={formData.token_a_mint_account}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Token B Mint Account"
              name="token_b_mint_account"
              value={formData.token_b_mint_account}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Admin Token A Account"
              name="admin_token_a_account"
              value={formData.admin_token_a_account}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Admin Token B Account"
              name="admin_token_b_account"
              value={formData.admin_token_b_account}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Token A Amount"
              name="token_a_amount"
              value={formData.token_a_amount}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Token B Amount"
              name="token_b_amount"
              value={formData.token_b_amount}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Start Tick"
              name="start_tick"
              value={formData.start_tick}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="End Tick"
              name="end_tick"
              value={formData.end_tick}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              sx={textFieldSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button
            onClick={() => setOpenModal(false)}
            sx={{
              color: isDark ? '#a1a1aa' : '#71717a',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
              },
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
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            Create Pool
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
