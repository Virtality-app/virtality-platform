import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'

type SplitStatCardProps = {
  title: string
  value: ReactNode
  children?: ReactNode
}

export function SplitStatCard({ title, value, children }: SplitStatCardProps) {
  return (
    <Card className='gap-3'>
      <CardHeader className='pb-0'>
        <CardTitle className='text-muted-foreground text-sm font-medium'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='text-3xl font-semibold tracking-tight'>{value}</div>
        {children}
      </CardContent>
    </Card>
  )
}
