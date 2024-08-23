<script lang="ts" setup>
import type { IUserDefaultFYearDetails } from "@/types/user.js";

const { $api } = useNuxtApp();

const canShowTxHistorySources = ref(false);
const isLoading = ref(true);

const userDefaultFYearDetails: Ref<IUserDefaultFYearDetails | null> = ref(null);

const getDefaultFYearDetails = async () => {
  try {
    const { data } = await $api.user.getDefaultFYearDetails({ server: false });
    if (data.value) {
      userDefaultFYearDetails.value = data.value;
      canShowTxHistorySources.value = !data.value?.needsNewSubscription;
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const onUpdateFinancialYearDetails = (data: IUserDefaultFYearDetails) => {
  userDefaultFYearDetails.value = data;
  canShowTxHistorySources.value = true;
};

onMounted(() => {
  getDefaultFYearDetails();
});

definePageMeta({
  title: "Dashboard :: Crypto Tax Labs",
  layout: "l-dashboard",
});
</script>

<template>
  <div class="overflow-y-auto relative">
    <loader :loading="isLoading" />
    <subscription
      v-if="userDefaultFYearDetails?.needsNewSubscription"
      :new-subscription-country-f-year-id="
        userDefaultFYearDetails?.newSubscriptionCountryFYearId || null
      "
      :new-subscription-country-id="
        userDefaultFYearDetails?.newSubscriptionCountryId || null
      "
      @update-user-financial-year-details="onUpdateFinancialYearDetails"
    />
    <financial-year
      v-if="canShowTxHistorySources"
      :user-default-f-year-details="userDefaultFYearDetails"
    />
  </div>
</template>
