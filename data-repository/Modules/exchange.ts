import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type { IExchange, ImportConfig } from "@/types/exchanges";

// ExchangeFactory class extending the FetchFactory
class ExchangeFactory extends FetchFactory {
  private readonly RESOURCE = "/Exchange";

  // Method to get a list of exchanges
  async getExchanges(asyncDataOptions?: AsyncDataOptions<IExchange[]>) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IExchange[]>(
        "GET",
        `${this.RESOURCE}/List`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async getExchangeImportConfig(
    asyncDataOptions?: AsyncDataOptions<ImportConfig[]>,
    exchangeId?: number,
    userFinancialYearId?: number,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<ImportConfig[]>(
        "GET",
        `${this.RESOURCE}/${exchangeId}/ListImportTypes`,
        undefined,
        {
          ...fetchOptions,
          query: {
            userFYearId: userFinancialYearId,
          },
        },
      );
    }, asyncDataOptions);
  }
}

export default ExchangeFactory;
