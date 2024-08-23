import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";

type IExchange = {
  id: number;
  logoUrl: string;
  name: string;
};

// ExchangeFactory class extending the FetchFactory
class TxSpamCoinFactory extends FetchFactory {
  private readonly RESOURCE = "/SpamCoin";

  async getSpamCoinList(
    asyncDataOptions?: AsyncDataOptions<IExchange[]>,
    financialYearId?: number,
    query?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "GET",
        `${this.RESOURCE}/List/fYearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }

  async getSpamCoinFilters(
    asyncDataOptions?: AsyncDataOptions<IExchange[]>,
    financialYearId?: number,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "GET",
        `${this.RESOURCE}/List/Filters/fYearId/${financialYearId}`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async markCoinAsSpam(
    asyncDataOptions?: AsyncDataOptions<IExchange[]>,
    financialYearId?: number,
    payload?: {
      exchangeId: number;
      coin: string;
      coinContractAddress: string;
      isSpam: boolean;
    }[],
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "POST",
        `${this.RESOURCE}/Batch/fYearId/${financialYearId}`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }
}

export default TxSpamCoinFactory;
