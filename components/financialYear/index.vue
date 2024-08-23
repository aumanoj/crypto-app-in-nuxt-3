<script setup lang="ts">
import type ExchangeSelectionModal from "@/components/financialYear/ExchangeSelectionModal.vue";
import { useRoute, useRouter } from 'vue-router';
import type { IUserDefaultFYearDetails } from "@/types/user";
import type { TransactionImport } from "~/types/exchanges";
import type { EmittedTransactionImportData } from "~/types/exchanges";
// import Stepper from "./Stepper.vue";

const props = defineProps<{
  userDefaultFYearDetails: IUserDefaultFYearDetails | null;
}>();

const route = useRoute();
const router = useRouter();

const exchangeSelectionModal: Ref<InstanceType<
  typeof ExchangeSelectionModal
> | null> = ref(null);

const transactionImportData: Ref<TransactionImport[] | null> = ref(null);

// Function to get step from hash
const getStepFromRoute = (): number => {
  const step = parseInt(route.hash.replace('#', ''), 10);
  return (!isNaN(step) && step >= 1 && step <= maxStepNumber) ? step : 1;
};
const currentStep: Ref<number> = ref(1);
const maxStepNumber:number = 6;

// Initialize currentStep from URL hash
onMounted(() => {
  currentStep.value = getStepFromRoute();
});

// Listen for hash changes (e.g., when user uses browser back/forward)
window.addEventListener('hashchange', () => {
  currentStep.value = getStepFromRoute();
});

const nextStep = () => {
  currentStep.value = Math.min(currentStep.value + 1, maxStepNumber); // Assuming 6 is the max step
};

const previousStep = () => {
  currentStep.value = Math.max(currentStep.value - 1, 1);
};

const getFYearDateText = computed(() => {
  if (!props.userDefaultFYearDetails) return "";

  const dateConfig = new Intl.DateTimeFormat("default", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const financialYearStart = dateConfig.format(
    new Date(props.userDefaultFYearDetails.fYearStart as string),
  );
  const financialYearEnd = dateConfig.format(
    new Date(props.userDefaultFYearDetails.fYearEnd as string),
  );

  return `Financial Year ${props.userDefaultFYearDetails.fYearText} ( ${financialYearStart} to ${financialYearEnd} )`;
});

const onCurrentStepChange = (step: number) => {
  currentStep.value = step;
};

const onTxImport = () => {
  if (!exchangeSelectionModal.value || !props.userDefaultFYearDetails?.id)
    return;

  exchangeSelectionModal.value.openExchangeSelectionModal(
    props.userDefaultFYearDetails.id,
  );
};

const onSaveSuccess = (data: EmittedTransactionImportData) => {
  transactionImportData.value = data.imports;
};

// Update route when currentStep changes
watch(currentStep, (newStep) => {
  router.replace({ hash: `#${newStep}` });
});

// Watch for route changes
watch(() => route.hash, () => {
  currentStep.value = getStepFromRoute();
});

</script>
<template>
  <div class="h-full container mx-auto px-5 pb-10">
    <div class="grid grid-cols-9 h-full gap-x-4">
      <div class="col-span-12 md:col-span-2 sm:col-span-12">
        <div
          class="grid grid-cols-1 gap-4 border dark:border-gray-700 rounded p-0 border-0"
        >
          <div class="p-4 pb-12 bg-gray-200 dark:bg-gray-800 text-xs font-semibold shadow-lg">
            <p class="lg:col-span-1">
              {{ getFYearDateText }}
            </p>
            <p>
              Local Currency: {{ userDefaultFYearDetails?.localCurrency }}
            </p>
          </div>
          
          <div class="shadow-lg">
            <financial-year-stepper
              :current-step="currentStep"
              @current-step-change="onCurrentStepChange($event)"
            />
          </div>
        </div>
      </div>
      <div class="col-span-12 md:col-span-7">
        <div class="pb-0">
          <template v-if="currentStep === 1">
            <financial-year-opening-balances
              :financial-year-id="userDefaultFYearDetails?.id"
            />
          </template>
          <template v-if="currentStep === 2">
            <div class="mb-3 lg:mb-4">
              <UButton
                @click="onTxImport"
                class="w-full sm:w-auto"
                color="primary"
              >
                <span>Add Exchange/Wallet/Chain</span>
              </UButton>
            </div>
            <financial-year-table
              :financial-year-id="userDefaultFYearDetails?.id"
              :transaction-import-data="transactionImportData"
            />
            <financial-year-exchange-selection-modal
              ref="exchangeSelectionModal"
              @save-success="onSaveSuccess"
            />
          </template>
          <template v-if="currentStep === 3">
            <financial-year-span-coin-list
              :financial-year-id="userDefaultFYearDetails?.id"
            />
          </template>
          <template v-if="currentStep === 4">
            <financial-year-review-record-list :financial-year-id="userDefaultFYearDetails?.id" />
          </template>
          <template v-if="currentStep === 5">
            <financial-year-tax-calculation :financial-year-id="userDefaultFYearDetails?.id" />
          </template>
          <template v-if="currentStep === 6">
           <financial-year-tax-report :financial-year-id="userDefaultFYearDetails?.id" />
          </template>
        </div>
        <div class="mt-4 flex justify-between">
          <button
            class="inline-flex items-center bg-base-50 border border-base-400 text-base-400 py-2 px-5 focus:outline-none hover:bg-base-100 dark:bg-primary-50-dark rounded text-sm"
            @click="previousStep"
          >
            <span>Back</span>
          </button>
          <button v-if="currentStep < maxStepNumber"
            class="inline-flex items-center bg-base-400 border border-base-400 md:border-0 py-2 px-5 focus:outline-none hover:bg-base-500 rounded text-white text-sm"
            @click="nextStep"
          >
            <span>Next</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
