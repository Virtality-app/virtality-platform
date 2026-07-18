import Image from 'next/image'
import ButtonToAction from './btn-to-action'
import HeroTitle from './hero-title'

/**
 * Full-bleed photograph backdrop hero: one large product photograph fills
 * the section and the copy sits on a soft light scrim over it.
 */
const HeroImageBackdrop = () => {
  return (
    <section className='min-h-screen-with-nav relative flex flex-col overflow-hidden bg-[#fbfaf7] dark:bg-zinc-900'>
      {/* Full-bleed backdrop photograph */}
      <div className='absolute inset-0'>
        <Image
          src='/hero/Gemini_Generated_Image_pvvcc4pvvcc4pvvc.png'
          alt='Patient putting on a VR headset during a guided therapy session'
          fill
          priority
          sizes='100vw'
          className='object-cover object-[48%_center] sm:object-[52%_center] md:object-[60%_center] lg:object-[68%_center]'
        />

        {/* Legibility scrim: light wash where the copy sits, image breathes toward the right */}
        <div className='absolute inset-0 bg-linear-to-r from-[#fbfaf7] via-[#fbfaf7]/92 to-[#fbfaf7]/35 sm:via-[#fbfaf7]/88 sm:to-[#fbfaf7]/20 md:via-[#fbfaf7]/82 md:to-[#fbfaf7]/10 lg:via-[#fbfaf7]/65 lg:to-transparent dark:from-zinc-900 dark:via-zinc-900/88 dark:to-zinc-900/15' />
        {/* Bottom fade so the image resolves into the next section */}
        <div className='absolute inset-0 bg-linear-to-t from-[#fbfaf7] via-transparent to-transparent dark:from-zinc-900' />
      </div>

      {/* Grain */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-overlay'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Banner */}
      <div className='relative z-10 flex min-h-11 w-full items-center justify-center bg-linear-to-r from-vital-blue-800 to-vital-blue-700 text-white shadow-md'>
        <p className='px-4 text-center text-[13px] font-medium tracking-wide'>
          Join our growing community of healthcare professionals by entering our{' '}
          <ButtonToAction />
        </p>
      </div>

      <div className='relative z-1 container m-auto flex flex-1 flex-col justify-center px-4 py-16 md:px-8 md:py-20'>
        <div className='max-w-xl'>
          <HeroTitle align='left' badge='logo' />
        </div>
      </div>
    </section>
  )
}

export default HeroImageBackdrop
