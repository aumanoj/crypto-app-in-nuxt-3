import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type { 
    TaxCalculatorData,
    PnlSummuryData
} from "@/types/tax-calculator";

// TaxCalculator class extending the FetchFactory
class TaxCalculator extends FetchFactory {
  private readonly RESOURCE = "/TaxEngine";

  // Method to get a list of review records
  async gettxCalulator(asyncDataOptions?: AsyncDataOptions<TaxCalculatorData>,
    financialYearId?: number,
    query?: Record<string, any>,
    ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TaxCalculatorData>(
        "GET",
        `${this.RESOURCE}/Calculate/fyearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }

  async taxCalcultionUpdate(
    asyncDataOptions?: AsyncDataOptions<TaxCalculatorData>,
    financialYearId?: number,
    payload?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<any | undefined>(
        "POST",
        `${this.RESOURCE}/Calculate/fyearId/${financialYearId}`,
        payload,
        fetchOptions
      );
    }, asyncDataOptions);
  }


  async getPnlSummary(
    asyncDataOptions?: AsyncDataOptions<PnlSummuryData[]>,
    financialYearId?: number,
    query?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<PnlSummuryData[]>(
        "get",
        `${this.RESOURCE}/PnLSummary/fYearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query }
      );
    }, asyncDataOptions);
  }
}

export default TaxCalculator;
