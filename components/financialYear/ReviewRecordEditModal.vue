<script lang="ts" setup>
import { ErrorNotifier } from "#components";

import type {
  ReviewRecordItem,
  ReviewRecordEdit,
} from "@/types/review-records";
import type { ErrorObject } from "~/types/api-instance";

const { $api } = useNuxtApp();
const props = defineProps<{
  financialYearId: number;
}>();
const emit = defineEmits(["save-success"]);
const reviewRecordLoader = ref(false);
const isOpen = ref(false);
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);
const reviewTransactions: Ref<any[]> = ref([]);
const reviewRecordOptions: Ref<any[]> = ref([]);
const dataItem: Ref<ReviewRecordItem | null> = ref(null);
const metadataLoading: Ref<boolean> = ref(false);
const selectedReviewRecord: Ref<ReviewRecordItem[]> = ref([]);

const reviewRecordEditModal = (row:ReviewRecordItem, financialYearId:number) => {
  isOpen.value = true;
  dataItem.value = row;
  editReviewRecord();
};

const columns = computed(() => {
  return [
    {
      label: "Exchange",
      key: "exchangeName",
    },
    {
      label: "Sub Exchange",
      key: "subExchangeName",
    },
    {
      label: "Tx Date UTC",
      key: "txDateUtc",
      class: "tx-date",
    },
    {
      label: "Direction",
      key: "direction",
    },
    {
      label: "Qty/Coin",
      key: "coin",
      class: "text-center",
    },
    {
      label: "Value/Currency",
      key: "currency",
      class: "text-center",
    },
    {
      label: "OrderNo",
      key: "orderNo",
    },
  ];
});

const rrecordItem = computed(() => {
  return { ...dataItem.value };
});

const state = reactive({
  convertTo: undefined,
  tradeSwapOption: 'Match with below pair',
});

const showTable = computed(() => state.convertTo === 'Trade/Swap');


const editReviewRecord = async () => {
  metadataLoading.value = true;
  const { data } = await $api.reviewRecord.reviewRecordEdit(
    {},
    props.financialYearId,
    { ...dataItem.value }
  );

  if (data.value) {
    const reviewRecord = data.value as ReviewRecordEdit;
    reviewTransactions.value = reviewRecord.relatedRecords;
    reviewRecordOptions.value = reviewRecord.options;
  }

  metadataLoading.value = false;
};

const submitForm = async () => {
  if (!state.convertTo) {
    errorNotifier.value?.show({
      message: "Please select a 'Convert to' option before saving.",
      statusCode: 400,
      statusMessage: "Validation Error",
      data: {
        title: "Validation Error",
        detail: "'Convert to' option is required",
        status: 400,
      },
    } as ErrorObject);
    return;
  }

  if (state.convertTo === "Trade/Swap" && 
      state.tradeSwapOption === "Match with below pair" && 
      selectedReviewRecord.value?.length === 0) {
    errorNotifier.value?.show({
      message: "Please select a record from the table.",
      statusCode: 400,
      statusMessage: "Validation Error",
      data: {
        title: "Validation Error",
        detail: "A record must be selected for 'Match with below pair'",
        status: 400,
      },
    } as ErrorObject);
    return;
  }

  try {
    const txHistoryIds = [
      dataItem.value?.txHistoryId,
      ...selectedReviewRecord.value.map((item) => item.txHistoryId),
    ];
    const { data, error } = await $api.reviewRecord.reviewRecordUpdate(
      {},
      props.financialYearId,
      {
        option: state.convertTo,
        txHistoryIds,
      }
    );
    if (data.value) {
      emit("save-success", data.value);
      isOpen.value = false
    } else if (error.value) {
      errorNotifier.value?.show(error.value as ErrorObject);
    }
  } catch (error) {
    console.log(error);
  }
};

const handleSelectionChange = (selected: any[]) => {
  if (selected.length > 1) {
    selectedReviewRecord.value = [selected[selected.length - 1]];
  } else {
    selectedReviewRecord.value = selected;
  }
};
const closeModal = () => {
  isOpen.value = false
};

defineExpose({
  reviewRecordEditModal,
});
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-7xl',
    }"
  >
    <UCard
      :ui="{
        ring: '',
        footer: {
          padding: 'py-4',
        },
        header: 'p-0 sm:p-0',
        base: 'overflow-hidden',
      }"
      class="relative"
    >
      <template #header>
        <div class="bg-gray-100 w-full">
          <div class="p-2 pl-4">
            <h2 class="text-lg font-medium text-gray-900">
              Edit Review Record
            </h2>
          </div>
        </div>
      </template>
      <div class="rounded-lg mb-8">
        <div
          class="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
        >
          <ErrorNotifier ref="errorNotifier" />

          <div class="space-y-6">
            <!-- Existing Transaction Details section -->
            <div>
              <h2 class="text-md font-semibold mb-2">
                Existing Transaction Details
              </h2>
              <div
                class="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-800 text-sm"
              >
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <!-- First vertical part -->
                  <div>
                    <div class="overflow-hidden text-ellipsis mb-2">
                      <strong>Exchange: </strong>
                      <UTooltip
                        class="overflow-hidden text-ellipsis"
                        :text="`${rrecordItem.subExchangeName}`"
                        :popper="{ arrow: true }"
                      >
                        <span class="inline-flex items-center">
                          {{ rrecordItem.exchangeName }}
                          (<span
                            class="truncate inline-block max-w-[calc(100%)]"
                            >{{ rrecordItem.subExchangeName }}</span
                          >)
                        </span>
                      </UTooltip>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="overflow-hidden text-ellipsis">
                        <strong>Direction: </strong>
                        <UTooltip
                          class="overflow-hidden text-ellipsis"
                          :text="`${rrecordItem.direction}`"
                          :popper="{ arrow: true }"
                        >
                          {{ rrecordItem.direction }}
                        </UTooltip>
                      </div>
                      <div class="overflow-hidden text-ellipsis">
                        <strong>TxDate Utc: </strong>
                        <UTooltip
                          class="overflow-hidden text-ellipsis"
                          :text="`${rrecordItem.txDateUtc}`"
                          :popper="{ arrow: true }"
                        >
                          {{ rrecordItem.txDateUtc }}
                        </UTooltip>
                      </div>
                    </div>
                  </div>

                  <!-- Second vertical part -->
                  <div>
                    <div class="overflow-hidden text-ellipsis mb-2">
                      <strong>Order Ref: </strong>
                      <UTooltip
                        class="overflow-hidden text-ellipsis"
                        :text="`${rrecordItem.orderNo}`"
                        :popper="{ arrow: true }"
                      >
                        <p class="truncate inline-block max-w-[calc(100%)]">
                          {{ rrecordItem.orderNo }}
                        </p>
                      </UTooltip>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <div class="overflow-hidden text-ellipsis">
                        <strong>Value/Currency: </strong>
                        <UTooltip
                          class="overflow-hidden text-ellipsis"
                          :text="`${rrecordItem.value} ${rrecordItem.currency}`"
                          :popper="{ arrow: true }"
                        >
                          <p class="truncate inline-block max-w-[calc(100%)]">
                            {{ rrecordItem.value }} {{ rrecordItem.currency }}
                          </p>
                        </UTooltip>
                      </div>
                      <div class="overflow-hidden text-ellipsis">
                        <strong>Qty/Coin: </strong>
                        <UTooltip
                          class="overflow-hidden text-ellipsis"
                          :text="`${rrecordItem.qty} ${rrecordItem.coin}`"
                          :popper="{ arrow: true }"
                        >
                          <p class="truncate inline-block max-w-[calc(100%)]">
                            {{ rrecordItem.qty }} {{ rrecordItem.coin }}
                          </p>
                        </UTooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Convert To section -->
            <div>
              <h2 class="text-md font-semibold mb-2">Convert To :</h2>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div
                  v-for="option in reviewRecordOptions"
                  :key="option"
                  class="convert-to-radio"
                  @click="state.convertTo = option"
                >
                  <URadio
                    v-model="state.convertTo"
                    :value="option"
                    :label="option"
                    :ui="{
                      wrapper: 'border-2 border-gray-200 rounded-md p-3 transition-all duration-300 hover:border-gray-300 cursor-pointer',
                      container: 'flex items-center h-full',
                      label: 'ml-2 text-sm cursor-pointer',
                      input: {
                        color: {
                          checked: 'bg-primary-500 border-primary-500',
                        },
                      },
                    }"
                    :class="{
                      'border-primary-500 bg-primary-50': state.convertTo === option,
                      'bg-white': state.convertTo !== option
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Trade/Swap Options and Table (conditionally rendered) -->
            <div v-if="showTable" class="border rounded-lg overflow-hidden">
              <div class="bg-blue-50 p-3 border-b border-gray-200">
                <div class="flex items-center space-x-4">
                  <h3 class="text-sm font-medium text-gray-700">Trade/Swap Options:</h3>
                  <URadio
                    v-model="state.tradeSwapOption"
                    value="Match with below pair"
                    label="Match with below pair"
                    class="trade-swap-radio"
                  />
                  <URadio
                    v-model="state.tradeSwapOption"
                    value="Not listed below"
                    label="Not listed below"
                    class="trade-swap-radio"
                  />
                </div>
              </div>

              <UTable
                v-model="selectedReviewRecord"
                :columns="columns"
                :rows="reviewTransactions"
                :loading="metadataLoading"
                @update:modelValue="handleSelectionChange"
                :ui="{
                  wrapper: 'max-h-64 overflow-y-auto',
                  thead: 'sticky top-0 z-10',
                  th: {
                    base: 'bg-white text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2',
                  },
                  td: {
                    base: 'px-4 py-2 text-sm',
                  },
                }"
              >
                <template #coin-data="{ row }">
                  <div class="grid grid-cols-11 text-center">
                    <p
                      class="text-right col-span-5 truncate"
                      :class="{ '': row.qtyDisplay?.length > 5 }"
                    >
                      {{ row.qtyDisplay }}
                    </p>
                    <div />
                    <UTooltip
                      class="col-span-5"
                      :text="`${row.qtyDisplay}  ${row.coin}`"
                      :popper="{ arrow: true }"
                    >
                      <p
                        class="truncate max-w-28"
                        :class="{ '': row.coin?.length > 5 }"
                      >
                        {{ row.coin }}
                      </p>
                    </UTooltip>
                  </div>
                </template>
                <template #currency-data="{ row }">
                  <div class="grid grid-cols-11 text-center">
                    <p
                      class="text-right col-span-5 truncate"
                      :class="{ '': row.netDisplay?.length > 5 }"
                    >
                      {{ row.netDisplay }}
                    </p>
                    <div />
                    <UTooltip
                      class="col-span-5"
                      :text="`${row.netDisplay}  ${row.currency}`"
                      :popper="{ arrow: true }"
                    >
                      <p
                        class="truncate max-w-28"
                        :class="{ '': row.currency.length > 5 }"
                      >
                        {{ row.currency }}
                      </p>
                    </UTooltip>
                  </div>
                </template>
                <template #fee-data="{ row }">
                  <div class="grid grid-cols-11 text-center">
                    <div class="text-right col-span-5">{{ row.feeDisplay }}</div>
                    <UTooltip
                      class="col-span-5"
                      :text="row.feeCoin ? row.feeCoin : ''"
                      :popper="{ arrow: true }"
                    >
                      <p
                        class="truncate max-w-28"
                        :class="{ 'text-red-400': row.feeCoin?.length > 5 }"
                      >
                        {{ row.feeCoin ? row.feeCoin : "" }}
                      </p>
                    </UTooltip>
                  </div>
                </template>
                <template #empty-state>
                  <div class="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
                    <UIcon name="i-heroicons-circle-stack-20-solid" class="mb-4 w-8 h-8 text-gray-400" />
                    <p class="text-sm text-gray-600">No Suggestions Found.</p>
                  </div>
                </template>
              </UTable>
            </div>
          </div>
          <loader :loading="reviewRecordLoader" />
        </div>
      </div>
      <template #footer>
        <div class="pt-3 flex justify-between">
          <button
            @click="closeModal()"
            class="border border-base-400 py-1 px-4 focus:outline-none rounded text-primary text-sm grow-0 max-w-24"
          >
            <span>Close</span>
          </button>
          <button
            @click="submitForm"
            type="submit"
            class="bg-base-400 border border-base-400 md:border-0 py-3 px-6 focus:outline-none hover:bg-base-500 rounded text-white text-sm grow-0 max-w-24"
          >
            Save
          </button>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
<style scoped>
:deep(tbody tr td:first-child) {
  width: 40px;
}

:deep(thead tr th:first-child) {
  @apply bg-gray-200 dark:bg-gray-700;
}

:deep(th:first-child input[type="checkbox"]) {
  @apply select-none cursor-not-allowed pointer-events-none opacity-0;
}

.convert-to-radio {
  @apply cursor-pointer;
}
.convert-to-radio :deep(input[type="radio"]) {
  @apply mt-0 pointer-events-none;
}
.convert-to-radio :deep(label) {
  @apply flex items-center w-full pointer-events-none;
}

.trade-swap-radio {
  @apply flex items-center;
}
.trade-swap-radio :deep(.u-label) {
  @apply text-sm ml-1 cursor-pointer;
}
.trade-swap-radio :deep(input[type="radio"]) {
  @apply w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500;
}
</style>