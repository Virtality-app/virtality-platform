import {
  BookMarkedIcon,
  User,
  CircleQuestionMark,
  ScrollText,
  RectangleGogglesIcon,
  LucideProps,
} from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

type SidebarLink = {
  title: string
  url: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}

const sidebarLinks: SidebarLink[] = [
  { title: 'devices', url: '/devices', icon: RectangleGogglesIcon },
  {
    title: 'patients',
    url: '/patients',
    icon: User,
  },
  {
    title: 'presets',
    url: '/presets',
    icon: BookMarkedIcon,
  },
  {
    title: 'guides',
    url: '/guides',
    icon: CircleQuestionMark,
  },
  { title: 'forms', url: '/forms', icon: ScrollText },
]

export default sidebarLinks
