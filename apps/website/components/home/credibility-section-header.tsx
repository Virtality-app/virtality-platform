import type { CredibilitySectionContent } from '@/lib/partner-press-content'

type CredibilitySectionHeaderProps = {
  content: CredibilitySectionContent
}

const CredibilitySectionHeader = ({
  content,
}: CredibilitySectionHeaderProps) => (
  <div className='mb-14 text-center'>
    <h2 className='mb-2 text-4xl leading-[1.1] font-black text-slate-900 md:text-5xl'>
      {content.titleLead}{' '}
      <span className='text-vital-blue-600'>{content.titleAccent}</span>
    </h2>
    <p className='mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500'>
      {content.intro}
    </p>
  </div>
)

export default CredibilitySectionHeader
