import ExchangeFactory from "@/data-repository/Modules/exchange";
import TxHistoryImportExchange from "@/data-repository/Modules/tx-history-import-exchange";
import TxHistorySources from "@/data-repository/Modules/tx-history-sources";
import type TxSpamCoinFactory from "@/data-repository/Modules/tx-span-coin";
import OpeningBalancesFactory from "~/data-repository/Modules/opening-balances";
import ReviewRecordsFactory from "~/data-repository/Modules/review-records";
import TaxCalculator from "~/data-repository/Modules/tax-calculator";
import UserFactory from "@/data-repository/Modules/user";
import TaxReportFactory from "~/data-repository/Modules/tax-report";

export interface IApiInstance {
  exchange: ExchangeFactory;
  user: UserFactory;
  txHistorySources: TxHistorySources;
  txHistoryImportExchange: TxHistoryImportExchange;
  txSpamCoin: TxSpamCoinFactory;
  openingBalance : OpeningBalancesFactory;
  reviewRecord : ReviewRecordsFactory;
  taxCalculator: TaxCalculator,
  taxReport: TaxReportFactory
}

export type ErrorObject = {
  message: string;
  statusCode: number;
  statusMessage: string;
  data?: {
    title?: string;
    detail?: string;
    status?: number;
  };
};
