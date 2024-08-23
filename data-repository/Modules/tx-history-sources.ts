import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type {
  Transaction,
  TransactionMetadata,
} from "~/types/transaction-sources";

type IExchange = {
  id: number;
  logoUrl: string;
  name: string;
};

// ExchangeFactory class extending the FetchFactory
class TxHistorySourcesFactory extends FetchFactory {
  private readonly RESOURCE = "/TxHistorySource";

  async getTxHistorySourceMetadata(
    asyncDataOptions?: AsyncDataOptions<TransactionMetadata>,
    financialYearId?: number,
    txHistorySourceExternalIdentifier?: string,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TransactionMetadata>(
        "GET",
        `${this.RESOURCE}/Metadata/${txHistorySourceExternalIdentifier}/fyearId/${financialYearId}`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  // Method to get a list of exchanges
  async getTxHistorySources(
    asyncDataOptions?: AsyncDataOptions<IExchange[]>,
    financialYearId?: number,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "GET",
        `${this.RESOURCE}/List/${financialYearId}`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async getTxHistorySource(
    asyncDataOptions?: AsyncDataOptions<IExchange[]>,
    financialYearId?: number,
    txHistorySourceExternalIdentifier?: string,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "GET",
        `${this.RESOURCE}/List/${financialYearId}`,
        undefined,
        {
          ...fetchOptions,
          query: {
            txHistorySourceExternalIdentifier,
          },
        },
      );
    }, asyncDataOptions);
  }

  async getTxHistorySourceTransactions(
    asyncDataOptions?: AsyncDataOptions<{
      totalPages: number;
      total: number;
      results: Transaction[];
    }>,
    financialYearId?: number,
    txHistorySourceExternalIdentifier?: string,
    query?: Record<any, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<{
        totalPages: number;
        total: number;
        results: Transaction[];
      }>(
        "GET",
        `/TxHistory/Import${this.RESOURCE}/${txHistorySourceExternalIdentifier}/fyearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }

  async deleteTxHistorySource(
    asyncDataOptions?: AsyncDataOptions<IExchange[]>,
    financialYearId?: number,
    txHistorySourceExternalIdentifier?: string,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "DELETE",
        `${this.RESOURCE}/${txHistorySourceExternalIdentifier}/fYearId/${financialYearId}`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }
}

export default TxHistorySourcesFactory;
