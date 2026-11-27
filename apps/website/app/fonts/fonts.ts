import localFont from 'next/font/local'

// Latin-subset variable fonts from Google Fonts, committed so `next build`
// never downloads them. Licences: the OFL-*.txt files in this folder.

export const dmSans = localFont({
  src: './DMSans-Variable-latin.woff2',
  variable: '--font-dm-sans',
  weight: '400 700',
  style: 'normal',
})

export const jetbrainsMono = localFont({
  src: './JetBrainsMono-Variable-latin.woff2',
  variable: '--font-jetbrains-mono',
  weight: '400 600',
  style: 'normal',
})

export const fraunces = localFont({
  src: [
    {
      path: './Fraunces-Variable-latin.woff2',
      weight: '500 600',
      style: 'normal',
    },
    {
      path: './Fraunces-Italic-Variable-latin.woff2',
      weight: '500 600',
      style: 'italic',
    },
  ],
  adjustFontFallback: 'Times New Roman',
})
