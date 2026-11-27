import localFont from 'next/font/local'

// Latin-subset variable font from Google Fonts, committed so `next build`
// never downloads it. Licence: OFL-Fraunces.txt in this folder.

export const fraunces = localFont({
  src: './Fraunces-Variable-latin.woff2',
  weight: '100 900',
  style: 'normal',
  adjustFontFallback: 'Times New Roman',
})
