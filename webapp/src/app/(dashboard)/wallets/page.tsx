'use client'

import Link from 'next/link'
import { Plus, Wallet, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { useWallets } from '@/hooks/useWallets'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatCycles, formatTimestamp, truncatePrincipal } from '@/lib/utils'

export default function WalletsPage() {
  const { wallets, isLoading, error } = useWallets()

  const mockWallets = wallets.length > 0 ? wallets : [
    {
      id: 'wallet-1',
      principal: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      balance: 5000000000000n,
      type: 'local' as const,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wallet-2',
      principal: 'be2us-64aaa-aaaaa-qaaca-cai',
      balance: 250000000000n,
      type: 'hardware' as const,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const recentTransactions = [
    { id: 'tx-1', type: 'receive', amount: 1000000000000n, from: 'a4cpr-kqaaa-aaaaa-qaaca-cai', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-2', type: 'send', amount: 500000000000n, to: 'xkb7u-4iaaa-aaaaa-qaaca-cai', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-3', type: 'receive', amount: 2500000000000n, from: 'rkp4c-7iaaa-aaaaa-aaaca-cai', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your ICP wallets and cycles
          </p>
        </div>
        <Link
          href="/wallets/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Connect Wallet
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-red-500">{error.message}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockWallets.map((wallet) => (
              <div key={wallet.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold capitalize">{wallet.type} Wallet</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Connected
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{formatCycles(wallet.balance)}</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {truncatePrincipal(wallet.principal)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {formatTimestamp(wallet.createdAt)}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                    <ArrowUp className="w-4 h-4" />
                    Send
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition">
                    <ArrowDown className="w-4 h-4" />
                    Receive
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <div className="border rounded-lg divide-y">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'receive' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.type} {formatCycles(tx.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {tx.type === 'receive' ? `From ${truncatePrincipal(tx.from as string)}` : `To ${truncatePrincipal(tx.to as string)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                    <Link href="#" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
