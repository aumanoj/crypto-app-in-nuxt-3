import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type { 
    TaxReports
} from "@/types/tax-report";

// TaxReport class extending the FetchFactory
class TaxReport extends FetchFactory {
  private readonly RESOURCE = "/TaxReport";

  // Method to get a list of review records
  async gettxReport(asyncDataOptions?: AsyncDataOptions<TaxReports>,
    financialYearId?: number,
    query?: Record<string, any>,
    ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<TaxReports>(
        "GET",
        `${this.RESOURCE}/Info/fyearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }
  async gettxReportDownload(asyncDataOptions?: AsyncDataOptions<Blob>,
    downloadUrl?: string
    ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<Blob>(
        "GET",
        `${downloadUrl}`,
        undefined,
        {},
      );
    }, asyncDataOptions);
  }

}

export default TaxReport;
