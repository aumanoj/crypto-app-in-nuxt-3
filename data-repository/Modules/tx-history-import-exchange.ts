import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type { $Fetch } from "ofetch";
import type { TransactionImport } from "~/types/exchanges";
import type { TransactionMetadata } from "~/types/transaction-sources";

type IExchange = {
  id: number;
  logoUrl: string;
  name: string;
};

// ExchangeFactory class extending the FetchFactory
class TxHistoryImportExchangeFactory extends FetchFactory {
  private readonly RESOURCE = "/TxHistory/Import/Exchange";

  // Method to import transactions with csv
  async txImportExchangeCsv(
    asyncDataOptions?: AsyncDataOptions<TransactionImport[]>,
    payload?: any,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions(true);
      return this.call<TransactionImport[]>(
        "POST",
        `${this.RESOURCE}/Csv`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async txImportExchangeWalletAddress(
    asyncDataOptions?: AsyncDataOptions<TransactionImport[]>,
    payload?: any,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TransactionImport[]>(
        "POST",
        `${this.RESOURCE}/Address`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async txImportExchangeApi(
    asyncDataOptions?: AsyncDataOptions<TransactionImport[]>,
    payload?: any,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TransactionImport[]>(
        "POST",
        `${this.RESOURCE}/API`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async getTransactionsByIdentifiers(
    asyncDataOptions?: AsyncDataOptions<TransactionImport>,
    financialYearId?: number,
    exchangeId?: number,
    txHistoryIdentifiers?: string[],
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TransactionImport>(
        "POST",
        `/TxHistory/import/TxHistory/Exchange/${exchangeId}/fyearId/${financialYearId}`,
        { txHistoryIdentifiers },
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async requeueTxHistorySource(
      asyncDataOptions?: AsyncDataOptions<TransactionImport>,
      financialYearId?: number,
      txHistorySourceExternalIdentifier?: string,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TransactionImport>(
          "POST",
          `/TxHistory/import/Requeue/fyearId/${financialYearId}`,
          { txHistorySourceExternalIdentifier },
          fetchOptions,
      );
    }, asyncDataOptions);
  }
}

export default TxHistoryImportExchangeFactory;
