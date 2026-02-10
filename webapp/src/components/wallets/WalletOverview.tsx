'use client'

import { Wallet, Plus, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatCycles, formatTimestamp, truncatePrincipal } from '@/lib/utils'
import type { Wallet as WalletType } from '@/lib/types'

interface WalletOverviewProps {
  wallets: WalletType[]
  onConnectWallet?: () => void
}

export function WalletOverview({ wallets, onConnectWallet }: WalletOverviewProps) {
  const totalCycles = wallets.reduce((sum, wallet) => sum + wallet.balance, 0n)
  const connectedWallets = wallets.length

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Balance</span>
            <Wallet className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{formatCycles(totalCycles)}</p>
          <p className="text-sm text-gray-500 mt-1">Across all wallets</p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Connected Wallets</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{connectedWallets}</p>
          <p className="text-sm text-gray-500 mt-1">Active connections</p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Status</span>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">Good</p>
          <p className="text-sm text-gray-500 mt-1">All wallets operational</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onConnectWallet}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Connect New Wallet
        </button>
      </div>
    </div>
  )
}
