import CredibilityLogo from '@/components/home/credibility-logo'
import PartnerRowLabel from '@/components/home/supported-by/partner-row-label'
import { SUPPORTED_BY_CONTENT } from '@/lib/partner-press-content'
import type { CredibilityLogoItem } from '@/lib/partner-press-content'

type ClinicalPartnersProps = {
  logos: readonly CredibilityLogoItem[]
  showLabel?: boolean
}

const ClinicalPartners = ({
  logos,
  showLabel = true,
}: ClinicalPartnersProps) => {
  if (logos.length === 0) {
    return null
  }

  return (
    <>
      {showLabel ? (
        <PartnerRowLabel label={SUPPORTED_BY_CONTENT.clinicalPartnersLabel} />
      ) : null}
      <div className='flex items-center justify-center gap-10'>
        {logos.map((logo) => (
          <CredibilityLogo key={logo.alt} item={logo} size='secondary' />
        ))}
      </div>
    </>
  )
}

export default ClinicalPartners
