import type { $Fetch, FetchOptions } from "ofetch";
import { useMSAuth } from "#imports";

abstract class FetchFactory {
  private readonly $fetch: $Fetch;

  constructor(fetcher: $Fetch) {
    this.$fetch = fetcher;
  }

  protected async getToken(): Promise<string | null> {
    const { acquireTokenSilent } = useMSAuth();
    return acquireTokenSilent();
  }

  protected async getFetchOptions(
      ignoreContentType?: boolean,
  ): Promise<FetchOptions<"json">> {
    const token = await this.getToken();
    return {
      headers: {
        ...(!ignoreContentType && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  }

  async call<T>(
      method: string,
      url: string,
      data?: object,
      fetchOptions?: FetchOptions<"json">,
      query?: Record<string, unknown>,
  ): Promise<T> {
    if (query) {
      fetchOptions = { ...fetchOptions, query };
    }

    const token = await this.getToken();

    if (token) {
      fetchOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return this.$fetch<T>(url, {
      method,
      body: data,
      ...fetchOptions,
    });
  }

  async callBlob(
    method: string,
    url: string,
    data?: object,
    fetchOptions?: Omit<FetchOptions<"blob">, 'responseType'>,
    query?: Record<string, unknown>,
  ): Promise<Response> {
    if (query) {
      fetchOptions = { ...fetchOptions, query };
    }

    const token = await this.getToken();

    if (token) {
      fetchOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return this.$fetch(url, {
      method,
      body: data,
      ...fetchOptions,
      responseType: 'blob',
    });
  }
}

export default FetchFactory;