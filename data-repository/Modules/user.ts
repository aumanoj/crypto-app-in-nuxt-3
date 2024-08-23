import type { AsyncDataOptions } from "#app";
import type {
  ICountry,
  ICountryFYearDetails,
  IUserDefaultFYearDetails,
  ISubscribeToFYearPayload,
} from "@/types/user";

import FetchFactory from "@/data-repository/factory";

class UserFactory extends FetchFactory {
  private readonly RESOURCE = "/User";

  // Method to fetch a list of countries
  async getCountries(asyncDataOptions?: AsyncDataOptions<ICountry[]>) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<ICountry[]>(
        "GET",
        `${this.RESOURCE}/GetCountries`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  // Method to fetch the default fiscal year details
  async getDefaultFYearDetails(
    asyncDataOptions?: AsyncDataOptions<IUserDefaultFYearDetails>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IUserDefaultFYearDetails>(
        "GET",
        `${this.RESOURCE}/GetUserDefaultFYearDetails`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  // Method to fetch fiscal year details for a specific country
  async getCountryFYearDetails(
    asyncDataOptions?: AsyncDataOptions<ICountryFYearDetails>,
    query?: Record<string, unknown>,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      if (query) fetchOptions.query = query;
      return this.call<ICountryFYearDetails>(
        "GET",
        `${this.RESOURCE}/GetCountryFYearDetails`,
        undefined,
        fetchOptions,
      );
    }, asyncDataOptions);
  }

  // Method to subscribe to a fiscal year
  async subscribeToFYear(
    asyncDataOptions?: AsyncDataOptions<IUserDefaultFYearDetails>,
    payload?: ISubscribeToFYearPayload,
  ) {
    return useAsyncData(async () => {
      const fetchOptions = await this.getFetchOptions();
      return this.call<IUserDefaultFYearDetails>(
        "POST",
        `${this.RESOURCE}/SubscribeToFYear`,
        payload,
        fetchOptions,
      );
    }, asyncDataOptions);
  }
}

export default UserFactory;
