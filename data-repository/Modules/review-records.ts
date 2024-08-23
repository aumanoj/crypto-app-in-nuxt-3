import type { AsyncDataOptions } from "#app";
import FetchFactory from "@/data-repository/factory";
import type { 
    ReviewRecordItems,
    ReviewRecordFilters,
    ReviewRecordEdit
} from "@/types/review-records";

// ReviewRecords class extending the FetchFactory
class ReviewRecords extends FetchFactory {
  private readonly RESOURCE = "/ReviewRecords";

  // Method to get a list of review records
  async getReviewRecords(asyncDataOptions?: AsyncDataOptions<ReviewRecordItems[]>,
    financialYearId?: number,
    query?: Record<string, any>,
    ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<ReviewRecordItems[]>(
        "GET",
        `${this.RESOURCE}/List/fyearId/${financialYearId}`,
        undefined,
        { ...fetchOptions, query },
      );
    }, asyncDataOptions);
  }

  async reviewRecordFilters(
    asyncDataOptions?: AsyncDataOptions<ReviewRecordFilters[]>,
    financialYearId?: number,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<ReviewRecordFilters[]>(
        "GET",
        `${this.RESOURCE}/List/Filters/fYearId/${financialYearId}`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  async reviewRecordEdit(
    asyncDataOptions?: AsyncDataOptions<ReviewRecordEdit>,
    financialYearId?: number,
    payload?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<ReviewRecordEdit>(
        "POST",
        `${this.RESOURCE}/GetEdit/fYearId/${financialYearId}`,
        payload,
        fetchOptions
      );
    }, asyncDataOptions);
  }
  async reviewRecordUpdate(
    asyncDataOptions?: AsyncDataOptions<ReviewRecordItems[]>,
    financialYearId?: number,
    payload?: Record<string, any>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<ReviewRecordItems[]>(
        "POST",
        `${this.RESOURCE}/Edit/fYearId/${financialYearId}`,
        payload,
        fetchOptions
      );
    }, asyncDataOptions);
  }
}

export default ReviewRecords;
