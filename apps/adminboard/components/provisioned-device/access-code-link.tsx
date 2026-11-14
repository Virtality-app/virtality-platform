import Link from 'next/link'
import { accessCodeSearchHref } from '@/lib/provisioned-device-display'

type AccessCodeLinkProps = {
  code: string | null
}

/** The headset's Access Code, opening the Access Codes table on it. */
export function AccessCodeLink({ code }: AccessCodeLinkProps) {
  if (!code) {
    return <span className='text-muted-foreground'>In inventory</span>
  }
  return (
    <Link
      href={accessCodeSearchHref(code)}
      className='font-mono text-xs underline-offset-4 hover:underline'
    >
      {code}
    </Link>
  )
}
