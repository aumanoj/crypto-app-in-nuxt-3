import i18nConfig from "./config/i18n";
import { RuntimeModes } from "./types/enums";

export default defineNuxtConfig({
  ssr: false,

  devtools: {
    enabled: true, //process.env.NODE_ENVIRONMENT === RuntimeModes.DEVELOPMENT,
  },

  devServer: {
    port: 8080,
  },

  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
        },
      ],
    },
  },

  colorMode: {
    preference: "system",
  },

  build: {},
  css: ["@/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: { config: "./tailwind.config.ts" },
      autoprefixer: {},
      ...(process.env.NODE_ENVIRONMENT === RuntimeModes.DEVELOPMENT
        ? { cssnano: {} }
        : {}),
    },
  },

  modules: [
    "@nuxt/image",
    "nuxt-icon",
    "dayjs-nuxt",
    [
      "@nuxt/ui",
      {
        safelistColors: ["base"],
      },
    ],
    [
      "@nuxtjs/sitemap",
      {
        url: process.env.SITE_URL,
        trailingSlash: true,
      },
    ],
    [
      "@nuxtjs/i18n",
      {
        ...i18nConfig,
        vueI18n: "./i18n.config.ts",
        baseUrl: process.env.SITE_URL,
      },
    ],
  ],

  routeRules: {
    ...(["/", "/ar-AE", "/dashboard", "/ar-AE/dashboard"].map((routeItem) => ({
      [routeItem]: { prerender: true },
    })) as any),
  },

  runtimeConfig: {
    public: {
      clientId: process.env.PUBLIC_CLIENT_ID,
      authority: process.env.PUBLIC_AUTHORITY,
      redirectUri: process.env.PUBLIC_REDIRECT_URI,
      resetPasswordUri: process.env.PUBLIC_RESET_PASSWORD_URI,
      postLogoutRedirectUri: process.env.PUBLIC_POSTLOGOUT_REDIRECT_URI,
      apiBaseUrl: process.env.PUBLIC_API_BASE_URL,
      apiScope: process.env.PUBLIC_API_SCOPE,
      knownAuthority: process.env.PUBLIC_KNOWN_AUTHORITY,

      exchangeListApiUrl: 'Exchange/List',
      getOrCreateUserApiUrl: 'Identity/SignUpSignIn',
      
    },
  },

  typescript: {
    typeCheck: true,
    strict: true,
  },

  compatibilityDate: "2024-07-18",
});
