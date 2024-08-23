import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import type { IApiInstance } from "@/types/api-instance";
import type { FetchOptions } from "ofetch";
import { $fetch } from "ofetch";

import ExchangeFactory from "@/data-repository/Modules/exchange";
import TxHistoryImportExchange from "@/data-repository/Modules/tx-history-import-exchange";
import TxHistorySources from "@/data-repository/Modules/tx-history-sources";
import TxSpamCoinFactory from "@/data-repository/Modules/tx-span-coin";
import UserFactory from "@/data-repository/Modules/user";
import OpeningBalancesFactory from "~/data-repository/Modules/opening-balances";
import ReviewRecordsFactory from "~/data-repository/Modules/review-records";
import TaxCalculatorFactory from "~/data-repository/Modules/tax-calculator";
import TaxReportFactory from "~/data-repository/Modules/tax-report";

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();

  const fetchOptions: FetchOptions = {
    baseURL: config.public.apiBaseUrl,
  };

  const apiFecther = $fetch.create(fetchOptions);

  const modules: IApiInstance = {
    exchange: new ExchangeFactory(apiFecther),
    user: new UserFactory(apiFecther),
    txHistorySources: new TxHistorySources(apiFecther),
    txHistoryImportExchange: new TxHistoryImportExchange(apiFecther),
    txSpamCoin: new TxSpamCoinFactory(apiFecther),
    openingBalance: new OpeningBalancesFactory(apiFecther),
    reviewRecord: new ReviewRecordsFactory(apiFecther),
    taxCalculator: new TaxCalculatorFactory(apiFecther),
    taxReport: new TaxReportFactory(apiFecther)
  };

  return {
    provide: {
      api: modules,
    },
  };
});
