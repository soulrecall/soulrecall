'use client'

import { useState } from 'react'
import { Archive as ArchiveIcon, Cloud, Download, Trash2, CheckCircle2, Clock, XCircle, Upload } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TimeAgo } from '@/components/common/TimeAgo'
import { formatBytes, formatCycles, formatTimestamp } from '@/lib/utils'
import type { Archive } from '@/lib/types'

const mockArchives: Archive[] = [
  {
    id: 'archive-1',
    status: 'completed',
    canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    size: 5242880n,
    checksum: 'a1b2c3d4e5f6...',
    arweaveTxId: 'tx-1234567890abcdef',
    cost: 500000000n,
  },
  {
    id: 'archive-2',
    status: 'uploading',
    canisterId: 'be2us-64aaa-aaaaa-qaaca-cai',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    size: 10485760n,
  },
  {
    id: 'archive-3',
    status: 'prepared',
    canisterId: 'a4cpr-kqaaa-aaaaa-qaaca-cai',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    size: 2097152n,
  },
]

export default function BackupsPage() {
  const [selectedCanister, setSelectedCanister] = useState('')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backups & Archives</h1>
          <p className="text-muted-foreground">
            Manage canister backups and Arweave archival storage
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          <Upload className="w-4 h-4" />
          Create Backup
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ArchiveIcon className="w-5 h-5 text-blue-500" />
            Quick Backup
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canister ID
              </label>
              <input
                type="text"
                placeholder="rrkah-fqaaa-aaaaa-aaaaq-cai"
                value={selectedCanister}
                onChange={(e) => setSelectedCanister(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                <Cloud className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Cloud className="w-5 h-5 text-purple-500" />
            Archive Storage
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Archived</span>
              <span className="font-semibold">3 canisters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Size</span>
              <span className="font-semibold">17.8 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-semibold">{formatCycles(500000000n)}</span>
            </div>
            <div className="pt-3 border-t">
              <button className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition">
                Manage Archive Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Archives</h2>
        <div className="border rounded-lg divide-y">
          {mockArchives.map((archive) => (
            <div key={archive.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {archive.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {archive.status === 'uploading' && <Clock className="w-5 h-5 text-blue-500" />}
                  {archive.status === 'prepared' && <Clock className="w-5 h-5 text-yellow-500" />}
                  {archive.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  <span className="font-mono text-sm">{archive.canisterId}</span>
                  <StatusBadge status={archive.status} />
                </div>
                <div className="flex items-center gap-2">
                  <TimeAgo timestamp={archive.timestamp} />
                  <button className="p-1.5 hover:bg-gray-100 rounded transition">
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Size: </span>
                  <span className="font-medium">{formatBytes(archive.size)}</span>
                </div>
                {archive.checksum && (
                  <div>
                    <span className="text-gray-600">Checksum: </span>
                    <span className="font-mono">{archive.checksum.slice(0, 12)}...</span>
                  </div>
                )}
                {archive.arweaveTxId && (
                  <div>
                    <span className="text-gray-600">Arweave: </span>
                    <span className="font-mono">{archive.arweaveTxId.slice(0, 12)}...</span>
                  </div>
                )}
                {archive.cost && (
                  <div>
                    <span className="text-gray-600">Cost: </span>
                    <span className="font-medium">{formatCycles(archive.cost)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
