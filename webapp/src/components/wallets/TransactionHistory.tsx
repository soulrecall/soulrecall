'use client'

import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { formatCycles, formatTimestamp, truncatePrincipal } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'send' | 'receive'
  amount: bigint
  from?: string
  to?: string
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  onViewDetails?: (txId: string) => void
}

export function TransactionHistory({ transactions, onViewDetails }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center text-gray-500">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="border rounded-lg divide-y">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onViewDetails?.(tx.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  tx.type === 'receive'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {tx.type === 'receive' ? (
                  <ArrowDown className="w-4 h-4" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-medium capitalize">
                  {tx.type} {formatCycles(tx.amount)}
                </p>
                <p className="text-sm text-gray-500">
                  {tx.type === 'receive'
                    ? `From ${truncatePrincipal(tx.from || '')}`
                    : `To ${truncatePrincipal(tx.to || '')}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {formatTimestamp(tx.timestamp)}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span
                  className={`text-xs ${
                    tx.status === 'confirmed'
                      ? 'text-green-600'
                      : tx.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {tx.status}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
