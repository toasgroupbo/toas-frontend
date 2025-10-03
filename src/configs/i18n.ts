export const i18n = {
  defaultLocale: 'es',
  locales: ['es', 'fr', 'ar'],
  langDirection: {
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
