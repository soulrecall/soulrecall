'use client'

import { Globe, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Network } from '@/lib/types'

const mockNetworks: Network[] = [
  {
    name: 'Local Network',
    status: 'connected',
    url: 'http://127.0.0.1:4943',
    nodeCount: 1,
  },
  {
    name: 'IC Mainnet',
    status: 'connected',
    url: 'https://ic0.app',
    nodeCount: 39,
  },
  {
    name: 'IC Testnet',
    status: 'degraded',
    url: 'https://rzm7w-iaaaa-aaaab-qa2qa-cai.ic0.app',
    nodeCount: 10,
  },
]

export default function NetworksPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Networks</h1>
        <p className="text-muted-foreground">
          View and manage ICP network connections
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockNetworks.map((network) => (
          <div key={network.name} className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">{network.name}</h3>
              </div>
              {network.status === 'connected' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {network.status === 'disconnected' && <XCircle className="w-5 h-5 text-gray-500" />}
              {network.status === 'degraded' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={network.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600">URL</p>
                <p className="text-sm font-mono">{network.url}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nodes</p>
                <p className="text-sm">{network.nodeCount}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Network</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network Name
            </label>
            <input
              type="text"
              placeholder="My Custom Network"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Add Network
          </button>
        </div>
      </div>
    </div>
  )
}
