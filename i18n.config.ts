import { currentLocales } from "./config/i18n";

export default defineI18nConfig(() => ({
  globalInjection: true,
  legacy: false,
  locale: "en-US",
  fallbackLocale: "en-US",
  availableLocalse: currentLocales.map((locale) => locale.code),
}));
