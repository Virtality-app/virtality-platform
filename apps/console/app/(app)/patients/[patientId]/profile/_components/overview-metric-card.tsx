'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { cn } from '@/lib/utils'
import MetricInfo from './session-metric-info'

interface OverviewMetricCardProps {
  icon: LucideIcon
  title: string
  description: string
  footnote?: string
  /** Stagger for the entrance, in seconds. */
  delay: number
  contentClassName?: string
  children: ReactNode
}

/** One card in the Sessions overview grid: icon, title, info and its value. */
const OverviewMetricCard = ({
  icon: Icon,
  title,
  description,
  footnote,
  delay,
  contentClassName,
  children,
}: OverviewMetricCardProps) => (
  <motion.div
    className='flex h-full'
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <Card className='flex h-full w-full flex-col overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300'>
          <Icon className='size-4 text-teal-600 dark:text-teal-400' />
          {title}
          <MetricInfo
            title={title}
            description={description}
            footnote={footnote}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('flex flex-1 flex-col', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  </motion.div>
)

export default OverviewMetricCard
