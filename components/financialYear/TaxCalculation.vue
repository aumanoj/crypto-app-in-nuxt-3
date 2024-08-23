<script lang="ts" setup>
import type { TaxCalculatorData, Entries } from "@/types/tax-calculator";
import { ErrorNotifier } from "#components";
import type { ErrorObject } from "~/types/api-instance";
const { taxCalculationProgress } = useSignalR();

const props = defineProps<{
  financialYearId: any;
}>();

const { $api } = useNuxtApp();
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);
const taxCalculatorData: Ref<TaxCalculatorData | undefined> = ref();
const taxCalculatorSummaryData: Ref<Entries[]> = ref([]);
const calculateTaxData: Ref<any | undefined> = ref();
const currentSort: Ref<{
  column: string;
  direction: "desc" | "asc";
}> = ref({
  column: "mstbQty",
  direction: "desc",
});

const state = reactive<{
  applyCgtDiscount: boolean | undefined;
}>({
  applyCgtDiscount: false,
});

const metadataLoading: Ref<boolean> = ref(false);
const isCalculating: Ref<boolean> = ref(false);
const metadataSummaryLoading: Ref<boolean> = ref(false);

const columns = computed(() => {
  return [
    {
      label: "More Sold Qty",
      key: "mstbQty",
      sortable: true,
    },
    {
      label: "More Sold Value",
      key: "mstbValue",
      sortable: true,
    },
    {
      label: "Coin",
      key: "coin",
      sortable: true,
    },
    {
      label: "Cost Basis",
      key: "costBasis",
      sortable: true,
    },
    {
      label: "Proceeds",
      key: "proceeds",
      sortable: true,
    },
    {
      label: "Profit/Loss",
      key: "pnl",
      sortable: true,
    },
    {
      label: "Closing Qty",
      key: "cbQty",
    },
    {
      label: "Is Nft?",
      key: "isNft",
    },
    {
      label: "Is Income?",
      key: "isIncOrExp",
    }
  ];
});

const loadData = async () => {
  const { data } = await $api.taxCalculator.gettxCalulator(
    {},
    props.financialYearId
  );

  if (data.value) {
    taxCalculatorData.value = data.value;
  }
};

const calculateTax = async () => {
  try {
    isCalculating.value = true;
    metadataLoading.value = true;
    const { data, error } = await $api.taxCalculator.taxCalcultionUpdate(
      {},
      props.financialYearId,
      {
        calculationMethod: taxCalculatorData.value?.calculationMethod,
        calculationMethodDisplay:
          taxCalculatorData.value?.calculationMethodDisplay,
        applyCgtDiscount: state.applyCgtDiscount,
        showRunningBalanceForMoreSoldThanBuys:
          taxCalculatorData.value?.showRunningBalanceForMoreSoldThanBuys,
        applyCgtDiscountText: taxCalculatorData.value?.applyCgtDiscountText,
        canApplyCgtDiscount: taxCalculatorData.value?.canApplyCgtDiscount,
      }
    );
    if (data.value) {
      calculateTaxData.value = data.value;
    } else if (error.value) {
      errorNotifier.value?.show(error.value as ErrorObject);
      isCalculating.value = false;
    }
  } catch (error) {
    console.log(error);
    isCalculating.value = false;
  }
  metadataLoading.value = false;
};

const pnlSummary = async () => {
  metadataSummaryLoading.value = true;
  const { data } = await $api.taxCalculator.getPnlSummary(
    {},
    props.financialYearId,
    {
      taxCalculationId: calculateTaxData.value?.taxCalculationId,
      ...(currentSort.value?.column && {
        orderBy: currentSort.value.column,
      }),
    }
  );

  if (data.value) {
    taxCalculatorSummaryData.value = (data.value as any).entries.map(
      (item: Entries) => {
        return {
          ...item,
        };
      }
    ) as Entries[];
  }
  metadataSummaryLoading.value = false;
};

onMounted(async () => {
  loadData(); 
  pnlSummary();
});

watch(
  () => taxCalculationProgress.value?.progressPerc,
  async (newVal) => {
    if (newVal && newVal === 100) {
      isCalculating.value = false;
      await pnlSummary();
    }
    if(newVal && newVal < 100){
      isCalculating.value = true;
    }
  }
);

watch(
  () => currentSort.value,
  () => {
    pnlSummary();
  },
  { deep: true }
);
</script>

<template>
  <div>
    <div class="flex justify-start items-center mb-4 space-x-4 w-full">
      <UCard
        :ui="{
          ring: '',
          footer: {
            padding: 'py-4',
          },
          header: 'p-0 sm:p-0',
          base: 'overflow-hidden w-full',
        }"
        class="relative"
      >
        <ErrorNotifier ref="errorNotifier" />

        <div class="mb-4 mt-2">
          <div class="grid grid-cols-12">
            <strong class="col-span-2">Calculation Method:</strong>
            <span class="col-span-6">{{
              taxCalculatorData?.calculationMethodDisplay
            }}</span>
          </div>
        </div>
        <div v-if="taxCalculatorData?.canApplyCgtDiscount">
          <div class="mb-4">
            <span class="inline-flex grid grid-cols-12">
              <strong class="col-span-2">Apply cgt discount: </strong>
              <UCheckbox v-model="state.applyCgtDiscount" class="col-span-6" />
            </span>
          </div>
          <div class="mb-4 grid grid-cols-12">
            <strong class="col-span-2"></strong>
            <span class="col-span-6">{{
              taxCalculatorData?.applyCgtDiscountText
            }}</span>
          </div>
        </div>

        <div class="mb-4 mt-2 grid grid-cols-12">
          <div class="col-span-2"></div>
          <div class="col-span-6">
            <UButton
              :loading="metadataLoading"
              :disabled="isCalculating"
              @click="calculateTax"
              color="primary"
              class="w-full sm:w-auto"
            >
              Calculate Tax
            </UButton>
          </div>
        </div>

        <div
          v-if="
            taxCalculationProgress?.progressPerc !== undefined &&
            taxCalculationProgress?.progressPerc < 100 &&
            taxCalculationProgress?.message?.toLowerCase() != 'completed'
          "
          class="flex flex-col justify-center items-center mx-auto text-center h-[200px]"
        >
          <span class="block mb-5">{{ taxCalculationProgress?.message }}</span>
          <UProgress
            size="lg"
            :value="taxCalculationProgress?.progressPerc"
            :ui="{
              progress: {
                rounded: 'rounded-md [&::-webkit-progress-bar]:rounded-md',
              },
            }"
          />
        </div>
      </UCard>
    </div>

    <div>
      <div class="bg-gray-100 w-full rounded">
        <div class="p-2 pl-4">
          <h2 class="text-lg font-medium text-gray-900">
            Profit & Loss Calculations:
          </h2>
        </div>
      </div>
      <div class="h-tax-calculation-stepper">
        <UTable
          ref="table"
          v-model:sort="currentSort"
          :columns="columns"
          :rows="isCalculating? [] : taxCalculatorSummaryData"
          class="border dark:border-gray-700 rounded"
          sort-asc-icon="i-heroicons-arrow-up-20-solid"
          sort-desc-icon="i-heroicons-arrow-down-20-solid"
          :loading="metadataSummaryLoading"
          :ui="{
            wrapper: 'h-full overflow-y-scroll',
            thead: 'sticky top-0 z-10',
            th: {
              base: 'sticky top-0 m-0 bg-gray-200 dark:bg-gray-800 !p-2',
              font: 'font-medium text-sm hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800',
            },
            tr: {
              base: `[&>td:first-child]:max-w-28 whitespace-nowrap`,
            },
            tbody:
              taxCalculatorSummaryData?.length > 0
                ? '[&>tr:last-child]:!border-b'
                : '',
            td: {
              padding: 'p-2',
              alignment: 'text-center',
            },
          }"
        >
          <template #mstbQty-data="{ row }">
            <div class="grid grid-cols-11">
              <UTooltip
                class="col-span-5"
                :text="`${row.mstbQty}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.mstbQty?.length > 5 }"
                >
                  {{ row.mstbQty }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #mstbValue-data="{ row }">
            <div class="grid grid-cols-11 text-center">
              <UTooltip
                class="col-span-5"
                :text="`${row.mstbValue}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.mstbValue?.length > 5 }"
                >
                  {{ row.mstbValue }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #coin-data="{ row }">
            <div class="grid grid-cols-11 text-center">
              <UTooltip
                class="col-span-5"
                :text="`${row.coin}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.coin?.length > 5 }"
                >
                  {{ row.coin }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #costBasis-data="{ row }">
            <div class="grid grid-cols-11 text-center">
              <UTooltip
                class="col-span-5"
                :text="`${row.costBasis}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.costBasis?.length > 5 }"
                >
                  {{ row.costBasis }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #proceeds-data="{ row }">
            <div class="grid grid-cols-11 text-center">
              <UTooltip
                class="col-span-5"
                :text="`${row.proceeds}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.proceeds?.length > 5 }"
                >
                  {{ row.proceeds }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #pnl-data="{ row }">
            <div class="grid grid-cols-11 text-center">
              <UTooltip
                class="col-span-5"
                :text="`${row.pnl}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.pnl?.length > 5 }"
                >
                  {{ row.pnl }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #cbQty-data="{ row }">
            <div class="grid grid-cols-11 text-center">
              <UTooltip
                class="col-span-5"
                :text="`${row.cbQty}`"
                :popper="{ arrow: true }"
              >
                <p
                  class="truncate max-w-36"
                  :class="{ '': row.cbQty?.length > 5 }"
                >
                  {{ row.cbQty }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #isNft-data="{ row }">
            {{ row.isNft? 'Yes':'No' }}
          </template>
          <template #isIncOrExp-data="{ row }">
            {{ row.isIncOrExp? 'Yes':'No' }}
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

<style></style>
