'use client'

import { usePartnerLogos } from '@virtality/react-query'
import CredibilityLogo from '@/components/home/credibility-logo'
import CredibilitySectionHeader from '@/components/home/credibility-section-header'
import { mapPartnerLogosToCredibilityLists } from '@/lib/partner-logo-adapter'
import { SUPPORTED_BY_CONTENT } from '@/lib/partner-press-content'
import { getVisiblePartnerRows } from '@/lib/partner-press'

function PartnerRowLabel({ label }: { label: string }) {
  return (
    <div className='my-8 flex items-center justify-center gap-6'>
      <div className='h-px max-w-32 flex-1 bg-linear-to-r from-transparent to-slate-200' />
      <span className='text-[9px] font-bold tracking-[0.35em] text-slate-400 uppercase'>
        {label}
      </span>
      <div className='h-px max-w-32 flex-1 bg-linear-to-l from-transparent to-slate-200' />
    </div>
  )
}

const PoweredBy = () => {
  const { data: partnerLogos = [] } = usePartnerLogos()
  const { strategicLogos, clinicalLogos } =
    mapPartnerLogosToCredibilityLists(partnerLogos)
  const partnerRows = getVisiblePartnerRows(strategicLogos, clinicalLogos)

  if (partnerRows.length === 0) {
    return null
  }

  const strategicRow = partnerRows.find((row) => row.kind === 'strategic')
  const clinicalRow = partnerRows.find((row) => row.kind === 'clinical')

  return (
    <section className='relative overflow-hidden bg-white py-20'>
      <div className='container m-auto px-4 md:px-8'>
        <CredibilitySectionHeader content={SUPPORTED_BY_CONTENT} />

        {strategicRow ? (
          <>
            <PartnerRowLabel
              label={SUPPORTED_BY_CONTENT.strategicPartnersLabel}
            />
            <div className='mb-8 flex flex-col items-center justify-center gap-10 sm:flex-row'>
              {strategicRow.logos.map((logo) => (
                <CredibilityLogo key={logo.alt} item={logo} size='primary' />
              ))}
            </div>
          </>
        ) : null}

        {strategicRow && clinicalRow ? (
          <PartnerRowLabel label={SUPPORTED_BY_CONTENT.clinicalPartnersLabel} />
        ) : null}

        {clinicalRow ? (
          <div className='flex items-center justify-center gap-10'>
            {clinicalRow.logos.map((logo) => (
              <CredibilityLogo key={logo.alt} item={logo} size='secondary' />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default PoweredBy
