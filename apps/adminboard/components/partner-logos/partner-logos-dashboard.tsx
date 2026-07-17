'use client'

import { Button } from '@/components/ui/button'
import { AddPartnerLogoDialog } from '@/components/partner-logos/add-partner-logo-dialog'
import { EditPartnerLogoDialog } from '@/components/partner-logos/edit-partner-logo-dialog'
import { PartnerLogoCategoryList } from '@/components/partner-logos/partner-logo-category-list'
import {
  groupPartnerLogosByCategory,
  PARTNER_LOGO_CATEGORIES,
  PARTNER_LOGO_CATEGORY_DESCRIPTIONS,
  PARTNER_LOGO_CATEGORY_LABELS,
} from '@/lib/partner-logos'
import { usePartnerLogos } from '@virtality/react-query'
import type { PartnerLogoListItem } from '@virtality/shared/types'
import { PlusSquare } from 'lucide-react'
import { useState } from 'react'

const PartnerLogosDashboard = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingLogo, setEditingLogo] = useState<PartnerLogoListItem | null>(
    null,
  )
  const { data: partnerLogos = [], isPending } = usePartnerLogos()
  const logosByCategory = groupPartnerLogosByCategory(partnerLogos)

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p className='text-muted-foreground max-w-2xl text-sm'>
            Assign Bucket Objects to the website Supported by section. Strategic
            and clinical logos publish immediately after save.
          </p>
        </div>
        <Button
          variant='primary'
          className='ml-auto flex items-center'
          onClick={() => setAddDialogOpen(true)}
        >
          <PlusSquare />
          Add partner logo
        </Button>
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        {PARTNER_LOGO_CATEGORIES.map((category) => (
          <PartnerLogoCategoryList
            key={category}
            title={PARTNER_LOGO_CATEGORY_LABELS[category]}
            description={PARTNER_LOGO_CATEGORY_DESCRIPTIONS[category]}
            logos={logosByCategory[category]}
            isLoading={isPending}
            onEdit={setEditingLogo}
          />
        ))}
      </div>

      <AddPartnerLogoDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <EditPartnerLogoDialog
        logo={editingLogo}
        onClose={() => setEditingLogo(null)}
      />
    </div>
  )
}

export default PartnerLogosDashboard
