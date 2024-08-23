<script lang="ts" setup>
import type {
  ReviewRecordItem,
  ReviewRecordUpdate,
} from "@/types/review-records";
const { reviewRecordProgress } = useSignalR();
import { DateTypeToggle } from "#components";
import FinancialYearReviewRecordEditModal from "@/components/financialYear/ReviewRecordEditModal.vue";
import { useScreenSize } from "@/composables/useScreenSize";
import { useUTableStyle } from "@/composables/useUTableStyle";
const { defaultPageSize } = useScreenSize();
const { tableStyle } = useUTableStyle();

const props = defineProps<{
  financialYearId: any;
}>();

const { $api } = useNuxtApp();
const ReviewTransactions: Ref<ReviewRecordItem[]> = ref([]);
const currentPage: Ref<number> = ref(1);
const totalRecords: Ref<number> = ref(0);
const currentSort: Ref<{
  column: string;
  direction: "desc" | "asc";
}> = ref({
  column: "txDate",
  direction: "desc",
});

const setCurrentSort = (orderBy: string) => {
  currentSort.value.column = orderBy;
  currentSort.value.direction =
    currentSort.value.direction === "asc" ? "desc" : "asc";
};

const getSortIcon = (orderBy: string): string => {
  if (orderBy !== currentSort.value.column)
    return "i-heroicons:arrows-up-down-20-solid";

  return currentSort.value.direction === "asc"
    ? "i-heroicons-arrow-up-20-solid"
    : "i-heroicons-arrow-down-20-solid";
};
const selectedDateType = ref<"txDateUtc" | "txDateLocal">("txDateUtc");
const metadataLoading: Ref<boolean> = ref(false);
const reviewRecordFilters: Ref<Record<any, any>[]> = ref([]);
const selectedExchange: Ref<Record<string, string>> = ref({});
const selectedSubExchanges: Ref<Record<string, string>> = ref({});
const editRecordData: Ref<ReviewRecordUpdate | null> = ref(null);
const financialYearReviewRecordEditModal: Ref<InstanceType<
  typeof FinancialYearReviewRecordEditModal
> | null> = ref(null);

const openReviewRecordEditModal = (row: ReviewRecordItem) => {
  if (!financialYearReviewRecordEditModal.value || !props.financialYearId)
    return;
  financialYearReviewRecordEditModal.value.reviewRecordEditModal(
    row,
    props.financialYearId
  );
};

const columns = computed(() => {
  return [
    {
      label: "Exchange",
      key: "exchangeName",
      sortable: true,
    },
    {
      label: "Sub Exchange",
      key: "subExchangeName",
      sortable: true,
    },
    {
      label: "Tx Date",
      key: "txDate",
      sortable: true,
      class: "tx-date",
    },
    {
      label: "Direction",
      key: "direction",
      sortable: true,
    },
    {
      label: "Coin",
      key: "coin",
      sortable: true,
      class: "text-center",
    },
    {
      label: "Currency",
      key: "currency",
      sortKey: "value",
      sortable: true,
      class: "text-center",
    },
    {
      label: "Order No",
      key: "orderNoUrl",
    },
    {
      label: "Action",
      key: "actions",
    },
  ];
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

const loadData = async (isInitialLoad: boolean = false) => {
  metadataLoading.value = true;
  const { data } = await $api.reviewRecord.getReviewRecords(
    {},
    props.financialYearId,
    {
      pageNo: currentPage.value,
      pageSize: defaultPageSize.value,
      ...(selectedExchange.value.id && {
        exchangeId: selectedExchange.value.id,
      }),
      ...(currentSort.value?.column && {
        orderBy: currentSort.value.column,
      }),
      ...(currentSort?.value.direction && {
        orderByDirection: currentSort.value.direction,
      }),
      reload: isInitialLoad ? "true" : "false",
    }
  );

  if (data.value) {
    ReviewTransactions.value = (data.value as any).results.map(
      (item: ReviewRecordItem) => {
        return {
          ...item,
        };
      }
    ) as ReviewRecordItem[];
    totalRecords.value = (data.value as any).total as number;
  }

  metadataLoading.value = false;
};

const loadFilters = async () => {
  const { data } = await $api.reviewRecord.reviewRecordFilters(
    {},
    props.financialYearId
  );

  if (data.value) {
    reviewRecordFilters.value = Object.entries(
      (data.value as any).exchangesLookup
    )
      .map(([key, value]) => ({
        id: parseInt(key, 10),
        label: value as string,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
};

const clearSelections = () => {
  selectedSubExchanges.value = {};
  selectedExchange.value = {};
  loadData();
};

const getTxDate = (row: ReviewRecordItem): string => {
  return selectedDateType.value === "txDateUtc"
    ? row.txDateUtc
    : row.txDateLocal;
};

const getSymbolColorClass = (row: ReviewRecordItem) => {
  return `${row.direction === "OUT" ? "text-red-500" : "text-green-500"}`;
};
const getCurrencyColorClass = (row: ReviewRecordItem) => {
  return `${row.direction === "OUT" ? "text-green-500" : "text-red-500"}`;
};

const handleEditData = (eventData: any) => {
  editRecordData.value = eventData;
  // loadData(); Calling list API after update the record
};

onMounted(async () => {
  loadData(true);
  loadFilters();
});

watch(
  () => currentSort.value,
  () => {
    loadData();
  },
  { deep: true }
);
</script>

<template>
  <div>
    <!-- Gray background search bar -->
    <div class="w-full bg-gray-200 dark:bg-gray-800 p-4 rounded-lg mb-4">
      <div class="flex items-center justify-between">
        <div class="flex-grow mr-4">
          <div class="flex items-center">
            <label for="sourcefilter" class="mr-2 text-sm">Exchange:</label>
            <USelectMenu
              searchable
              v-model="selectedExchange"
              :options="reviewRecordFilters"
              placeholder="Select Exchange"
              size="sm"
              class="flex-grow"
            >
              <template #label>
                <div
                  v-if="selectedExchange?.label"
                  class="flex justify-between w-full cursor-pointer"
                  @click.stop="(selectedExchange = {}) && loadData()"
                >
                  <span class="truncate">{{ selectedExchange.label }}</span>
                  <UIcon name="i-heroicons-x-mark-20-solid" class="text-xl" />
                </div>
              </template>
            </USelectMenu>
          </div>
        </div>
        <div class="flex items-center">
          <UButton
            variant="soft"
            class="mr-2"
            size="sm"
            @click="clearSelections"
            >Clear</UButton
          >
          <UButton size="sm" @click="(currentPage = 1) && loadData()"
            >Filter</UButton
          >
        </div>
      </div>
    </div>

    <div class="">
      <UTable
        ref="table"
        v-model:sort="currentSort"
        :columns="columns"
        :rows="ReviewTransactions"
        class="border dark:border-gray-700 rounded"
        sort-asc-icon="i-heroicons-arrow-up-20-solid"
        sort-desc-icon="i-heroicons-arrow-down-20-solid"
        :loading="metadataLoading"
        :ui="tableStyle"
      >
        <template #loading-state>
          <div
            class="flex flex-col justify-center items-center mx-auto text-center max-w-56 h-[300px]"
          >
            <span class="block mb-5">{{ reviewRecordProgress?.message }}</span>
            <UProgress
              size="lg"
              :value="reviewRecordProgress?.progressPerc"
              :ui="{
                progress: {
                  rounded: 'rounded-md [&::-webkit-progress-bar]:rounded-md',
                },
              }"
            />
          </div>
        </template>
        <template #exchangeName-data="{ row }">
          <UButton
            variant="link"
            class="text-black underline"
            :disabled="
              (() => {
                return editRecordData?.convertedTxHistoryIds.includes(
                  row.txHistoryId
                );
              })()
            "
            @click="openReviewRecordEditModal(row)"
          >
            {{ row.exchangeName }}
          </UButton>
          <financial-year-review-record-edit-modal
            ref="financialYearReviewRecordEditModal"
            :financialYearId="props.financialYearId"
            @save-success="handleEditData"
          />
        </template>

        <template #txDate-header="{ column }">
          <div
            class="flex items-center cursor-pointer"
            @click="setCurrentSort('txDate')"
          >
            <DateTypeToggle
              v-model:modelValue="selectedDateType"
              :label="column.label"
            />
            <UIcon :name="getSortIcon('txDate')" class="ml-1 flex-shrink-0" />
          </div>
        </template>
        <template #coin-header="{ column }">
          <div
            class="flex items-center cursor-pointer"
            @click="setCurrentSort('symbol')"
          >
            {{ column.label }}
            <UIcon :name="getSortIcon('symbol')" class="ml-1 flex-shrink-0" />
          </div>
        </template>
        <template #currency-header="{ column }">
          <div
            class="flex items-center cursor-pointer"
            @click="setCurrentSort('value')"
          >
            {{ column.label }}
            <UIcon :name="getSortIcon('value')" class="ml-1 flex-shrink-0" />
          </div>
        </template>

        <template #subExchangeName-data="{ row }">
          <UTooltip :text="row.subExchangeName" :popper="{ arrow: true }">
            <p class="truncate max-w-30 ml-2">{{ row.subExchangeName }}</p>
          </UTooltip>
        </template>
        <template #txDate-data="{ row }">
          <span class="flex justify-center">{{
            formatDate(getTxDate(row))
          }}</span>
        </template>
        <template #txDateLocal-data="{ row }">
          <span class="flex justify-center">{{
            formatDate(row.txDateLocal)
          }}</span>
        </template>
        <template #coin-data="{ row }">
          <div
            :class="[
              'grid grid-cols-1 gap-1 px-1 w-full',
              getSymbolColorClass(row),
            ]"
          >
            <UTooltip
              :text="`${row.qtyDisplay} ${row.coin}`"
              :popper="{ arrow: true }"
            >
              <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.qtyDisplay }} {{ row.coin }}
              </p>
            </UTooltip>
          </div>
        </template>
        <template #currency-data="{ row }">
          <div
            :class="[
              'grid grid-cols-1 gap-1 px-1 w-full',
              getCurrencyColorClass(row),
            ]"
          >
            <UTooltip
              :text="`${row.netDisplay} ${row.currency}`"
              :popper="{ arrow: true }"
            >
              <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                {{ row.netDisplay }} {{ row.currency }}
              </p>
            </UTooltip>
          </div>
        </template>
        <template #orderNoUrl-data="{ row }">
          <div class="truncate max-w-28 text-ellipsis whitespace-nowrap">
            <UTooltip :text="row.orderNo" :popper="{ arrow: true }">
              <ULink
                :to="row.orderNoUrl"
                class="truncate max-w-28 text-blue-500 underline"
                target="_blank"
              >
                {{ row.orderNo }}
              </ULink>
            </UTooltip>
          </div>
        </template>
        <template #actions-data="{ row }">
          <div class="flex items-center ms-2">
            <UButton
              variant="soft"
              class="me-2"
              size="xs"
              @click="openReviewRecordEditModal(row)"
            >
              Review
            </UButton>
            </div>
        </template>
        <template #empty-state>
          <div
            class="flex flex-col items-center justify-center p-4 sm:p-8 text-center"
          >
            <UIcon
              name="i-heroicons-circle-stack-20-solid"
              class="mb-4 w-8 h-8 text-primary-300"
            />
            <div
              class="flex flex-col sm:flex-row items-center text-sm text-gray-600"
            >
              <p class="mb-2 sm:mb-0 sm:mr-2 text-primary-500">
                No records to review at this time. Everything is up to date !!
              </p>
            </div>
          </div>
        </template>
      </UTable>
    </div>
    <div class="w-full flex justify-center mt-5">
      <UPagination
        v-model="currentPage"
        size="2xs"
        :page-count="defaultPageSize"
        :total="totalRecords"
        :active-button="{ color: 'black' }"
        :inactive-button="{ variant: 'ghost', color: 'black' }"
        :prev-button="{ variant: 'ghost' }"
        :next-button="{ variant: 'ghost' }"
        :ui="{
          wrapper: 'space-x-2',
          rounded: 'first:rounded-full last:rounded-full',
          base: 'rounded-full w-8 h-8 flex items-center justify-center',
        }"
        @update:modelValue="loadData()"
      />
    </div>
  </div>
</template>

<style>
.tx-date > div > div {
  display: flex;
}
</style>
