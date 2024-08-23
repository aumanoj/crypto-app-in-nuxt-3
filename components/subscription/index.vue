<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";
import type ErrorNotifier from "@/components/global/ErrorNotifier.vue";
import type { ICountry, ICountryFYearDetails } from "@/types/user";
import { z } from "zod";

const { $api } = useNuxtApp();

const props = defineProps<{
  newSubscriptionCountryFYearId: null | number;
  newSubscriptionCountryId: null | number;
}>();

const emit = defineEmits(["update-user-financial-year-details"]);

const countriesList: Ref<ICountry[]> = ref([]);
const countryFinancialYearDetails: Ref<ICountryFYearDetails | null> = ref(null);
const countriesLoading = ref(true);
const fYearDetailsLoading = ref(false);
const savingFYearDetailsLoading = ref(false);
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);

const schema = z.object({
  country: z.number(),
  financialYear: z.number(),
  timezone: z.string(),
});

type Schema = z.output<typeof schema>;

const state = reactive<{
  country: number | undefined;
  financialYear: number | undefined;
  timezone: string | undefined;
}>({
  country: undefined,
  financialYear: undefined,
  timezone: undefined,
});

const allFieldsSelected = computed(() => {
  return state.country && state.financialYear && state.timezone;
});

const countryFinancialYearsList = computed(() => {
  if (!countryFinancialYearDetails.value) return [];

  return countryFinancialYearDetails.value.countryFYears;
});

const countryTimezonesList = computed(() => {
  if (!countryFinancialYearDetails.value) return [];

  return countryFinancialYearDetails.value.timeZoneIds;
});

const getDetails = async (isInitialCall?: boolean) => {
  try {
    countriesLoading.value = true;

    if (!isInitialCall) {
      state.financialYear = undefined;
      state.timezone = undefined;
    }

    const { data: countries } = await $api.user.getCountries();
    if (countries.value) {
      countriesList.value = countries.value;
    }
  } catch (e) {
    console.log(e);
  } finally {
    countriesLoading.value = false;
  }
};

const getFinancialYearsForCountry = async () => {
  fYearDetailsLoading.value = true;
  try {
    const { data: financialYearDetails } =
      await $api.user.getCountryFYearDetails(
        {
          server: false,
        },
        {
          countryId: state.country,
        },
      );

    if (financialYearDetails.value) {
      if (
        financialYearDetails.value &&
        financialYearDetails.value.timeZoneIds
      ) {
        financialYearDetails.value.timeZoneIds =
          financialYearDetails.value.timeZoneIds.map((timezone) => {
            return {
              id: timezone,
              name: timezone,
            };
          }) as any;
      }
      countryFinancialYearDetails.value = financialYearDetails.value;
    }
  } catch (e) {
    console.log(e);
  } finally {
    fYearDetailsLoading.value = false;
  }
};

const onSubscribeFinancialYear = async (event: FormSubmitEvent<Schema>) => {
  savingFYearDetailsLoading.value = true;
  try {
    const { data, error } = await $api.user.subscribeToFYear(
      { server: false },
      {
        countryFYearId: event.data.financialYear,
        timeZoneId: event.data.timezone,
      },
    );

    if (error.value) {
      errorNotifier.value?.show(error.value as any);
    }

    if (data.value && !isNaN(data.value.id as number)) {
      const { id } = data.value;
      emit("update-user-financial-year-details", { ...data.value });
    }
  } catch (e) {
    console.error(e);
  } finally {
    savingFYearDetailsLoading.value = false;
  }
};

watch(
  () => state.country,
  () => {
    getFinancialYearsForCountry();
  },
);

watch(
  () => props.newSubscriptionCountryFYearId,
  () => {
    if (props.newSubscriptionCountryFYearId) {
      state.financialYear = props.newSubscriptionCountryFYearId;
    }
  },
  { immediate: true },
);

watch(
  () => props.newSubscriptionCountryId,
  () => {
    if (props.newSubscriptionCountryId) {
      state.country = props.newSubscriptionCountryId;
    }
  },
  { immediate: true },
);

onMounted(() => {
  getDetails(true);
});
</script>
<template>
  <div class="h-full flex items-center justify-center">
    <UCard class="w-2/4">
      <template #header>
        <span class="text-xl font-medium">Lets define your tax settings:</span>
      </template>

      <ErrorNotifier ref="errorNotifier" class="mb-4" />

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubscribeFinancialYear"
      >
        <UFormGroup label="Country" name="country">
          <USelectMenu
            v-model="state.country"
            searchable
            searchable-placeholder="Search for a country ..."
            :search-attributes="['displayName']"
            class="w-full"
            placeholder="Select a country"
            :options="countriesList"
            option-attribute="name"
            value-attribute="id"
            size="lg"
            :loading="countriesLoading"
          />
        </UFormGroup>

        <UFormGroup label="Financial Year" name="financialYear">
          <USelectMenu
            v-model="state.financialYear"
            class="w-full"
            placeholder="Select financial year"
            :options="countryFinancialYearsList"
            option-attribute="fYear"
            value-attribute="id"
            size="lg"
            :disabled="!countryFinancialYearDetails"
            :loading="fYearDetailsLoading"
          />
        </UFormGroup>

        <UFormGroup label="Timezone" name="timezone">
          <USelectMenu
            v-model="state.timezone"
            searchable
            searchable-placeholder="Search for timezone ..."
            :search-attributes="['id']"
            class="w-full"
            placeholder="Select timezone"
            :options="countryTimezonesList"
            option-attribute="name"
            value-attribute="id"
            size="lg"
            :disabled="!countryFinancialYearDetails"
            :loading="fYearDetailsLoading"
          />
        </UFormGroup>

        <div class="pt-5 max-w-28">
          <UButton
            type="submit"
            block
            size="xl"
            :loading="savingFYearDetailsLoading"
            class="space-y-8"
            :disabled="!allFieldsSelected"
          >
            Submit
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
