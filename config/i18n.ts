import type { NuxtI18nOptions, LocaleObject, LocaleFile } from "@nuxtjs/i18n";

// #TODO: Add more countries
const countriesLocaleVariants: Map<
  string,
  (LocaleObject & { country?: boolean })[]
> = new Map([["ar-AE", [{ country: true, code: "ar-AE", name: "Arabic" }]]]);

const locales: Set<LocaleObject> = new Set([
  {
    code: "ar-AE",
    iso: "ar-AE",
    file: "ar-AE.js",
    name: "Arabic",
    dir: "rtl",
  },
  {
    code: "en-US",
    iso: "en-US",
    file: "en-US.js",
    name: "English",
  },
]);

function buildLocale(): LocaleObject[] {
  const useableLocales: Set<LocaleObject> = new Set();

  for (const baseLocale of locales) {
    const countryLocales = countriesLocaleVariants.get(baseLocale.code);

    if (countryLocales) {
      countryLocales.forEach((locale) => {
        const entry: LocaleObject = {
          ...baseLocale,
          ...locale,
          files: [baseLocale.file!, `${locale.iso}.js`] as LocaleFile[],
        };
        useableLocales.add(entry);
      });
    } else {
      useableLocales.add(baseLocale);
    }
  }

  return Array.from(useableLocales).sort((a, b) =>
    a.code.localeCompare(b.code),
  );
}

export const currentLocales = buildLocale();

const i18nConfig: NuxtI18nOptions = {
  locales: currentLocales,
  lazy: true,
  langDir: "locales/",
  defaultLocale: "en-US",
};

export default i18nConfig;
