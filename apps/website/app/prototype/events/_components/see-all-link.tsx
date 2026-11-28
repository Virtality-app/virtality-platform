import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type SeeAllLinkProps = {
  href: string
  label: string
  className?: string
}

const SeeAllLink = ({ href, label, className }: SeeAllLinkProps) => (
  <Link
    href={href}
    className={cn(
      'group text-vital-blue-700 inline-flex items-center gap-2 text-sm font-semibold',
      className,
    )}
  >
    {label}
    <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
  </Link>
)

export default SeeAllLink
