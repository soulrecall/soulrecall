'use client'

import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TimeAgo } from '@/components/common/TimeAgo'
import type { Task } from '@/lib/types'

export function TaskQueueTable({ tasks }: { tasks: Task[] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="border rounded-lg divide-y">
      {tasks.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No tasks found
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(task.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{task.type}</span>
                    <StatusBadge status={task.status} showDot={false} />
                  </div>
                  <p className="text-sm text-gray-600">{task.message}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{task.progress}%</span>
                </div>
                <TimeAgo timestamp={task.createdAt} className="text-xs" />
              </div>
            </div>
            {task.error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {task.error}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
