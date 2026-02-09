'use client'

import { Activity, AlertCircle, CheckCircle2, Database, Server } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CanisterStatusCard } from '@/components/dashboard/CanisterStatusCard'
import { MetricsChart } from '@/components/dashboard/MetricsChart'
import { AlertsFeed } from '@/components/dashboard/AlertsFeed'
import { NetworkStatusBadge } from '@/components/dashboard/NetworkStatusBadge'

export default function CanistersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Canisters</h1>
          <p className="text-muted-foreground">
            Monitor and manage your deployed canisters
          </p>
        </div>
        <NetworkStatusBadge />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <CanisterStatusCard
          canisterId="rrkah-fqaaa-aaaaa-aaaaq-cai"
          status="running"
          cycles={5000000000000n}
          memory={2097152n}
          lastActivity={new Date(Date.now() - 5 * 60 * 1000)}
        />
        <CanisterStatusCard
          canisterId="be2us-64aaa-aaaaa-qaaca-cai"
          status="running"
          cycles={3200000000000n}
          memory={1048576n}
          lastActivity={new Date(Date.now() - 30 * 60 * 1000)}
        />
        <CanisterStatusCard
          canisterId="a4cpr-kqaaa-aaaaa-qaaca-cai"
          status="stopped"
          cycles={0n}
          memory={0n}
          lastActivity={new Date(Date.now() - 2 * 60 * 60 * 1000)}
        />
        <CanisterStatusCard
          canisterId="xkb7u-4iaaa-aaaaa-qaaca-cai"
          status="error"
          cycles={500000000n}
          memory={524288n}
          lastActivity={new Date(Date.now() - 1 * 60 * 1000)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricsChart />
        <AlertsFeed />
      </div>
    </div>
  )
}
