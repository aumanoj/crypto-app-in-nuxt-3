import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type { 
  OpeningBalanceItems, 
  OpeningBalancesImportType, 
  OpeningBalanceFilters, 
  OpeningBalanceItem 
} from "@/types/opening-balances";

// OpeningBalancesFactory class extending the FetchFactory
class OpeningBalancesFactory extends FetchFactory {
[x: string]: any;
  private readonly RESOURCE = "/OpeningBalance"; 

  async openingBalanceslist(
    asyncDataOptions?: AsyncDataOptions<OpeningBalanceItems[]>,
    financialYearId?: number,
    query?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<OpeningBalanceItems[]>(
        "GET",
        `${this.RESOURCE}/List/fYearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }

  async getOpeningBalancesImportType(
    asyncDataOptions?: AsyncDataOptions<OpeningBalancesImportType[]>,
    financialYearId?: number,
    query?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<OpeningBalancesImportType[]>(
        "GET",
        `${this.RESOURCE}/List/ImportTypes/fYearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }

  async getOpeningBalancesFilters(
    asyncDataOptions?: AsyncDataOptions<OpeningBalanceFilters[]>,
    financialYearId?: number,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<OpeningBalanceFilters[]>(
        "GET",
        `${this.RESOURCE}/List/Filters/fYearId/${financialYearId}`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }


  async openingBalancesImportFiles(
    asyncDataOptions?: AsyncDataOptions<OpeningBalanceItem>,
    payload?: any,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions(true);
      return this.call<OpeningBalanceItem>(
        "POST",
        `${this.RESOURCE}/Import`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async deleteOpeningBalances(
    asyncDataOptions?: AsyncDataOptions<OpeningBalanceItem>,
    financialYearId?: number,
    payload?: any,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions(true);
      return this.call<OpeningBalanceItem>(
        "DELETE",
        `${this.RESOURCE}/Delete/fYearId/${financialYearId}`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

}

export default OpeningBalancesFactory;
