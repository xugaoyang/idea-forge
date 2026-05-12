import type { IdeaStatus, Priority } from '../../types'

const statusConfig: Record<IdeaStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-slate-700 text-slate-300' },
  analyzing: { label: '分析中', className: 'bg-amber-900/50 text-amber-300' },
  planned: { label: '已规划', className: 'bg-blue-900/50 text-blue-300' },
  developing: { label: '开发中', className: 'bg-purple-900/50 text-purple-300' },
  completed: { label: '已完成', className: 'bg-emerald-900/50 text-emerald-300' },
  archived: { label: '已归档', className: 'bg-slate-800 text-slate-500' },
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: '低', className: 'bg-slate-700 text-slate-400' },
  medium: { label: '中', className: 'bg-blue-900/50 text-blue-300' },
  high: { label: '高', className: 'bg-orange-900/50 text-orange-300' },
  critical: { label: '紧急', className: 'bg-red-900/50 text-red-300' },
}

export function StatusBadge({ status }: { status: IdeaStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}优先
    </span>
  )
}

export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-brand-900/40 text-brand-300 border border-brand-800/50">
      {tag}
    </span>
  )
}
