import { motion } from 'motion/react'
import {
  AlertTriangle,
  CheckCircle,
  Frown,
  Info,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotifyVariant = 'success' | 'error' | 'info' | 'attention'

const ICONS: Record<NotifyVariant, LucideIcon> = {
  success: CheckCircle,
  error: Frown,
  info: Info,
  attention: AlertTriangle,
}

const SHAKE = {
  x: [0, -10, 10, -8, 8, -4, 4, 0],
  transition: { duration: 0.6 },
}

interface NotifyToastProps {
  variant: NotifyVariant
  message: string
}

const NotifyToast = ({ variant, message }: NotifyToastProps) => {
  const Icon = ICONS[variant]
  const attention = variant === 'attention'

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      exit={{ opacity: 0, x: '100%' }}
      whileInView={variant === 'error' ? SHAKE : undefined}
      className={cn('flex w-full items-center gap-2', attention && 'gap-3')}
    >
      <Icon className={cn('shrink-0', attention && 'size-6 text-amber-500')} />
      <span className={cn(attention && 'font-medium')}>{message}</span>
    </motion.div>
  )
}

export default NotifyToast
