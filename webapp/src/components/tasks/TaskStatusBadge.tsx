'use client'

import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskStatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed'
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          label: 'Pending',
        }
      case 'running':
        return {
          icon: Clock,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          label: 'Running',
        }
      case 'completed':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          label: 'Completed',
        }
      case 'failed':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          label: 'Failed',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bgColor, config.textColor, className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}
