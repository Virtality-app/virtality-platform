'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@virtality/ui/components/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@virtality/ui/components/sidebar'
import { sidebarNav } from '@/data/static/sidebar-nav'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavItems({
  items,
  pathname,
  nested = false,
}: {
  items: (typeof sidebarNav)[number]['items']
  pathname: string
  nested?: boolean
}) {
  const { state } = useSidebar()
  const isIconCollapsed = state === 'collapsed'

  return (
    <SidebarMenu className={cn(isIconCollapsed && 'items-center')}>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={isActivePath(pathname, item.href)}
            tooltip={item.title}
            className={
              nested && !isIconCollapsed
                ? 'text-sidebar-foreground font-medium'
                : undefined
            }
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function CollapsibleNavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: (typeof sidebarNav)[number]['items']
  pathname: string
}) {
  const { state } = useSidebar()
  const isIconCollapsed = state === 'collapsed'
  const [open, setOpen] = useState(true)

  return (
    <Collapsible
      open={isIconCollapsed || open}
      onOpenChange={setOpen}
      className='group/collapsible'
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className='text-muted-foreground hover:text-sidebar-foreground gap-1 text-[11px] font-semibold tracking-wider uppercase'>
            {label}
            <ChevronRight className='ml-auto size-3.5 opacity-60 transition-transform group-data-[state=open]/collapsible:rotate-90' />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent
            className={cn(
              !isIconCollapsed && 'border-sidebar-border/70 ml-2 border-l pl-1',
            )}
          >
            <NavItems items={items} pathname={pathname} nested />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

const AppSidebar = () => {
  const pathname = usePathname()

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='h-15 shrink-0 rounded-none border-b' />
      <SidebarContent>
        {sidebarNav.map((group) => {
          const groupKey = group.label ?? group.items[0]?.href

          if (!group.label) {
            return (
              <SidebarGroup key={groupKey}>
                <SidebarGroupContent>
                  <NavItems items={group.items} pathname={pathname} />
                </SidebarGroupContent>
              </SidebarGroup>
            )
          }

          return (
            <CollapsibleNavGroup
              key={groupKey}
              label={group.label}
              items={group.items}
              pathname={pathname}
            />
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
