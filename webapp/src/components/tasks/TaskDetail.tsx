'use client'

import { CheckCircle2, Clock, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatTimestamp } from '@/lib/utils'
import type { Task } from '@/lib/types'

interface TaskDetailProps {
  task: Task
  onRetry?: () => void
  isRetrying?: boolean
}

export function TaskDetail({ task, onRetry, isRetrying }: TaskDetailProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-6 h-6 text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getStatusIcon(task.status)}
          <div>
            <h2 className="text-2xl font-bold capitalize">{task.type}</h2>
            <p className="text-sm text-gray-600">{task.id}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
        {task.status === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Retry
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold">Progress</h3>
          <div className="border rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <p className="text-2xl font-bold mt-2">{task.progress}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Timing</h3>
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Started:</span>
              <span>{formatTimestamp(task.createdAt)}</span>
            </div>
            {task.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span>{formatTimestamp(task.completedAt)}</span>
              </div>
            )}
            {task.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>
                  {Math.round((new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / 1000)}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Details</h3>
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium capitalize">{task.type}</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <StatusBadge status={task.status} className="ml-2" />
          </div>
          <div>
            <span className="text-gray-600">Message:</span>
            <p className="mt-1 text-sm">{task.message}</p>
          </div>
          {task.error && (
            <div>
              <span className="text-gray-600">Error:</span>
              <div className="mt-1 p-3 bg-red-50 rounded text-sm text-red-700">
                {task.error}
              </div>
            </div>
          )}
        </div>
      </div>

      {task.status === 'completed' && (
        <div className="flex justify-end">
          <a
            href="#"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View Logs
          </a>
        </div>
      )}
    </div>
  )
}
