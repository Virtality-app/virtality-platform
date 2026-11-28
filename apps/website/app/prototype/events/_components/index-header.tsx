type IndexHeaderProps = {
  title: string
  lead: string
}

/** Mirrors the /blog header so the Events page reads as its sibling. */
const IndexHeader = ({ title, lead }: IndexHeaderProps) => (
  <header className='border-b border-slate-300/70 dark:border-zinc-800'>
    <div className='container mx-auto px-4 py-16 md:px-8 md:py-20'>
      <h1 className='text-vital-blue-700 max-w-3xl text-4xl font-medium tracking-tight text-balance md:text-5xl'>
        {title}
      </h1>
      <p className='mt-4 max-w-2xl text-lg text-pretty text-slate-600 dark:text-slate-400'>
        {lead}
      </p>
    </div>
  </header>
)

export default IndexHeader
