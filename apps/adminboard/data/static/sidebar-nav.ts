import { EFFECTIVENESS_REPORT_COPY } from '@/lib/effectiveness-report-copy'
import type { LucideIcon } from 'lucide-react'
import {
  Grid3x3,
  Images,
  LayoutDashboard,
  LineChart,
  LinkIcon,
  Mail,
  Trash2,
  UserPlus,
} from 'lucide-react'

export type SidebarNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const sidebarNav: SidebarNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      {
        title: EFFECTIVENESS_REPORT_COPY.navLabel,
        href: '/effectiveness',
        icon: LineChart,
      },
    ],
  },
  {
    items: [{ title: 'Bucket', href: '/bucket', icon: Trash2 }],
  },
  {
    label: 'Content',
    items: [
      { title: 'Partner logos', href: '/partner-logos', icon: Images },
      { title: 'Mosaic', href: '/mosaic', icon: Grid3x3 },
      { title: 'Email', href: '/email', icon: Mail },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Referral', href: '/referral', icon: LinkIcon },
      { title: 'Create user', href: '/admin/create-user', icon: UserPlus },
    ],
  },
]
