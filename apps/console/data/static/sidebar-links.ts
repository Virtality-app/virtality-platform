import {
  BookMarkedIcon,
  User,
  CircleQuestionMark,
  ScrollText,
  RectangleGogglesIcon,
  Film,
  LucideProps,
} from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { resolveVrExperiencesNavEnabled } from '@/lib/vr-experiences-feature'

type SidebarLink = {
  /** Stable English id, also sent as the analytics `item`. */
  title: string
  /** Label key in the `layout` namespace. */
  labelKey: string
  url: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  /** Omit the link from the rendered sidebar when this returns false. */
  enabled?: () => boolean
}

const sidebarLinks: SidebarLink[] = [
  {
    title: 'patients',
    labelKey: 'sidebar.links.patients',
    url: '/patients',
    icon: User,
  },
  {
    title: 'programs',
    labelKey: 'sidebar.links.programs',
    url: '/programs',
    icon: BookMarkedIcon,
  },
  {
    title: 'VR experiences',
    labelKey: 'sidebar.links.vrExperiences',
    url: '/vr-video',
    icon: Film,
    enabled: resolveVrExperiencesNavEnabled,
  },
  {
    title: 'devices',
    labelKey: 'sidebar.links.devices',
    url: '/devices',
    icon: RectangleGogglesIcon,
  },
  {
    title: 'guides',
    labelKey: 'sidebar.links.guides',
    url: '/guides',
    icon: CircleQuestionMark,
  },
  {
    title: 'forms',
    labelKey: 'sidebar.links.forms',
    url: '/forms',
    icon: ScrollText,
  },
]

export function getVisibleSidebarLinks(): SidebarLink[] {
  return sidebarLinks.filter((link) => link.enabled?.() ?? true)
}

export default sidebarLinks
