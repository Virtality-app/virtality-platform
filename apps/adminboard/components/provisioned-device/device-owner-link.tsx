import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import Link from 'next/link'
import { customerProfileHref } from '@/lib/provisioned-device-display'

type DeviceOwnerLinkProps = {
  owner: ProvisionedDeviceListItem['owner']
}

/** Who redeemed the code and owns the headset, linking to their profile. */
export function DeviceOwnerLink({ owner }: DeviceOwnerLinkProps) {
  if (!owner) return <span className='text-muted-foreground'>—</span>
  return (
    <Link
      href={customerProfileHref(owner.id)}
      className='underline-offset-4 hover:underline'
    >
      {owner.name}
    </Link>
  )
}
