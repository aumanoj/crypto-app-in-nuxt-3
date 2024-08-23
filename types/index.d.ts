import "nuxt";
import type { IApiInstance } from "@/types/api-instance";

declare module "#app" {
  interface NuxtApp {
    $api: IApiInstance;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api: IApiInstance;
  }
}
