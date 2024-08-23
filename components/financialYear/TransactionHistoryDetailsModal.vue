<script lang="ts" setup>
import type {
  Transaction,
  TransactionMetadata,
} from "@/types/transaction-sources";
import DateTypeToggle from '@/components/global/DateTypeToggle.vue';  // Adjust the path as needed

import { useDayjs } from "#dayjs";
import { useUTableStyle } from '@/composables/useUTableStyle';
import type { _height } from "#tailwind-config/theme";

const { tableStyle } = useUTableStyle();
const dayjs = useDayjs();

const props = defineProps<{
  externalIdentifier: string;
  userFYearId: number;
}>();

const modal = useModal();

const { $api } = useNuxtApp();
const transactions: Ref<Transaction[]> = ref([]);
const currentPage: Ref<number> = ref(1);
const totalPages: Ref<number> = ref(1);
const defaultPageSize: Ref<number> = ref(20);
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
    currentSort.value.direction = currentSort.value.direction === 'asc' ? 'desc' : 'asc';
};

const getSortIcon = (orderBy: string): string => {

  if(orderBy !== currentSort.value.column) return 'i-heroicons:arrows-up-down-20-solid';

    return currentSort.value.direction === 'asc'
      ? 'i-heroicons-arrow-up-20-solid'
      : 'i-heroicons-arrow-down-20-solid';
};
const selectedDateType = ref<'txDateUtc' | 'txDateLocal'>('txDateUtc');
const canShowSubExchangeDropdown = ref(false);

const metadataLoading: Ref<boolean> = ref(false);
const metadata: Ref<TransactionMetadata | null> = ref(null);

const selectedTags: Ref<Record<string, string>> = ref({});
const selectedSubExchanges: Ref<Record<string, string>> = ref({});
const selectedSymbols: Ref<string> = ref("");
const startDate: Ref<string> = ref("");
const endDate: Ref<string> = ref("");

const expandedElement: Ref<number> = ref(0);

const getSymbolColorClass = (row: Transaction) => {
  return `${row.tradeType === 1 ? 'text-red-500' : 'text-green-500'}`;
};
const getCurrencyColorClass = (row: Transaction) => {
  return `${row.tradeType === 1 ? 'text-green-500' : 'text-red-500'}`;
};
const getFeeColorClass = (row: Transaction) => { return 'text-red-500'};

const columns = computed(() => {
  return [
    ...(canShowSubExchangeDropdown.value
      ? [
          {
            label: "Sub Exchange",
            key: "subExchangeName",
            class: 'w-1/12',
          },
        ]
      : []),
    {
      label: "Tx Date",
      key: 'txDate',
      sortable: true,
      class: "tx-date w-2/12",
    },
    {
      label: "Type",
      key: "recordTypeDisplay",
      class: "w-1/12",
    },
    {
      label: "Trade type",
      key: "tradeTypeDisplay",
      class: "w-1/12",
    },
    {
      label: "Coin",
      key: "symbol",
      sortable: true,
      class: "text-center w-2/12",
    },
    {
      label: "Currency",
      key: "currency",
      sortable: true,
      class: "text-center w-2/12",
    },
    {
      label: "Fee",
      key: "fee",
      class: "text-center w-2/12",
    },
    {
      label: "Order ref",
      key: "orderNoUrl",
      class: isLargeScreen.value ? "w-2/12" : "hidden",
    },
    {
      label: "Tags",
      key: "tags",
      class: isLargeScreen.value ? "w-2/12" : "hidden"
    },
    {
      label: "",
      key: "expandable",
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

const expandRow = (event: Event, row: Transaction) => {
  if (expandedElement.value) {
    const el = document.getElementById(String(expandedElement.value));
    el?.remove();
    if (expandedElement.value === row.id) {
      expandedElement.value = 0;
      return;
    }
  }

  const orderNoHtml = !isLargeScreen.value
    ? `<p>
      <span class="font-semibold">Order Ref.:</span> 
      <a href=${row.orderNoUrl} class="truncate max-w-28 text-blue-500 underline" target="_blank">
      ${ row.orderNo }
      </a>
    </p>`
    : '';

  const tagsHtml = !isLargeScreen.value
  ? `<p><span class="font-semibold">Tags:</span> ${row.tags.join(", ")}</p>`
  : '';

  const currentRow = (event.target as HTMLElement).closest(
    "tr",
  ) as HTMLTableRowElement;
  console.log(row);
  currentRow.insertAdjacentHTML(
    "afterend",
    `
      <tr id="${row.id}" class="whitespace-nowrap">
        <td colspan="${columns.value.length}" class="whitespace-nowrap p-2 text-gray-500 dark:text-gray-400 text-sm">
          <div class="grid grid-cols-1 text-sm font-light p-2">
              ${row.notes ? `<p><span class="font-semibold">Note:</span> ${row.notes}</p>` : ""}
              ${row.symbolContractAddress ? `<span><span class="font-semibold">Symbol contract address:</span> ${row.symbolContractAddress}</span>` : ""}
              ${row.currencyContractAddress ? `<span><span class="font-semibold">Currency contract address:</span> ${row.currencyContractAddress}</span>` : ""}
              ${orderNoHtml}
              ${tagsHtml}
              ${!row.notes && !row.symbolContractAddress && !row.currencyContractAddress && row.tags.length === 0 ? "<div> No extra data for this transaction. </div>" : ""}
          </div>
        </td>
      </tr>`,
  );
  expandedElement.value = row.id;
};

const getTagsLookups = computed(() => {
  if (!metadata.value || !metadata.value.tagsLookup) return [];

  return Object.keys(metadata.value.tagsLookup).map((key: string) => ({
    id: key,
    label: metadata.value?.tagsLookup[key],
  }));
});

const getSubExchangeLookups = computed(() => {
  if (!metadata.value || !metadata.value.subExchangesLookup) return [];

  return Object.keys(metadata.value.subExchangesLookup).map((key: string) => ({
    id: key,
    label: metadata.value?.subExchangesLookup?.[key],
  }));
});

const loadData = async (isFiltering?: true) => {
  metadataLoading.value = true;
  if (isFiltering) currentPage.value = 1;
  const { data } = await $api.txHistorySources.getTxHistorySourceTransactions(
    {},
    props.userFYearId,
    props.externalIdentifier,
    {
      pageNo: isFiltering ? 1 : currentPage.value,
      pageSize: defaultPageSize.value,
      fromDateTime: startDate.value
        ? dayjs(startDate.value).format("YYYY-MM-DD[T]00:00:00")
        : metadata.value?.minFromDateUtc,
      toDateTime: startDate.value
        ? dayjs(endDate.value).format("YYYY-MM-DD[T]00:00:00")
        : metadata.value?.maxToDateUtc,
      ...(selectedSymbols.value && { symbolOrCurrency: selectedSymbols.value }),
      ...(selectedTags.value.id && { tagId: selectedTags.value.id }),
      ...(selectedSubExchanges.value.id && {
        subExchangeId: selectedSubExchanges.value.id,
      }),
      ...(currentSort.value?.column && {
        orderBy: currentSort.value.column,
      }),
      ...(currentSort?.value.direction && {
        orderByDirection: currentSort.value.direction,
      }),
    },
  );

  if (data.value) {
    transactions.value = data.value.results;
    totalPages.value = data.value.totalPages;
    totalRecords.value = data.value.total;
  }

  metadataLoading.value = false;
};

const loadMetadata = async () => {
  const { data: _data } =
    await $api.txHistorySources.getTxHistorySourceMetadata(
      {
        server: false,
      },
      props.userFYearId,
      props.externalIdentifier,
    );

  if (_data.value) {
    metadata.value = _data.value;
    canShowSubExchangeDropdown.value = _data.value.canShowSubExchangeDropdown;
    startDate.value = dayjs(metadata.value.minFromDateUtc).format("YYYY-MM-DD");
    endDate.value = dayjs(metadata.value.maxToDateUtc).format("YYYY-MM-DD");
  }
};

const clearSelections = () => {
  selectedSubExchanges.value = {};
  selectedSymbols.value = "";
  selectedTags.value = {};
  loadData();
};

const onClearSymbol = () => {
  selectedSymbols.value = "";
  loadData();
};

const closeModal = () => {
  modal.close();
};

const isExpanderVisible = (row: Transaction) => {
  return (
    row.notes ||
    row.otherOrderNoInfo.length > 0 ||
    row.currencyContractAddress ||
    row.symbolContractAddress ||
    (!isLargeScreen.value && row.orderNo) || 
    (!isLargeScreen.value && row.tags)
  );
};

const getTxDate = (row: Transaction): string => {
  return selectedDateType.value === 'txDateUtc' ? row.txDateUtc : row.txDateLocal;
};

const isLargeScreen = computed(() => {
  return window.innerWidth > 1024;
});
const isMediumScreen = computed(() => {
  return window.innerWidth >= 768 && window.innerWidth < 1024; // Adjust these values if needed
});
const isSmallScreen = computed(() => {
  return window.innerWidth < 768; // Adjust these values if needed
});

watch(
  () => props.externalIdentifier,
  () => {
    if (props.externalIdentifier) {
      loadData();
      loadMetadata();
    }
  },
  { immediate: true },
);

watch(
  () => currentSort.value,
  () => {
    loadData();
  },
  { deep: true }
);
</script>

<template>
  <UModal
    :ui="{
      width: 'w-full sm:max-w-7xl',
    }"
  >
    <UCard
      :ui="{
        body: {
          padding: 'h-[750px]',
        },
        footer: {
          base: 'bg-white',
        },
        header: 'p-0 sm:p-0',
        base: 'overflow-hidden',
      }"
    >
    <template #header>
      <div class="bg-gray-100 w-full">
        <div class="p-2 pl-4">
          <h2 class="text-lg font-medium text-gray-900">Exchange Transactions</h2>
        </div>
      </div>
    </template>

      <!-- Search bar -->
      <div class="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg mb-4">
        <div class="flex flex-wrap items-end">
          <div v-if="canShowSubExchangeDropdown" class="w-full md:w-1/4 lg:w-1/5 pr-2 mb-2 md:mb-0">
            <label class="block mb-1 text-xs">Sub-exchange:</label>
            <USelectMenu
              class="w-full"
              searchable
              v-model="selectedSubExchanges"
              :options="getSubExchangeLookups"
              placeholder="Select Sub-exchange"
              size="sm"
            >
              <template #label>
                <div
                  v-if="selectedSubExchanges?.label"
                  class="flex justify-between w-full cursor-pointer"
                  @click.stop="(selectedSubExchanges = {}) && loadData()"
                >
                  <span class="truncate">{{ selectedSubExchanges.label }}</span>
                  <UIcon name="i-heroicons-x-mark-20-solid" class="text-xl" />
                </div>
              </template>
            </USelectMenu>
          </div>
          <div class="w-full md:w-1/4 lg:w-1/5 pr-2 mb-2 md:mb-0">
            <label class="block mb-1 text-xs">Tags:</label>
            <USelectMenu
              class="w-full"
              searchable
              v-model="selectedTags"
              :options="getTagsLookups"
              placeholder="Select Tags"
              size="sm"
            >
              <template #label>
                <div
                  v-if="selectedTags?.label"
                  class="flex justify-between w-full cursor-pointer"
                  @click.stop="(selectedTags = {}) && loadData()"
                >
                  <span class="truncate">{{ selectedTags.label }}</span>
                  <UIcon name="i-heroicons-x-mark-20-solid" class="text-xl" />
                </div>
              </template>
            </USelectMenu>
          </div>
          <div class="w-full md:w-1/4 lg:w-1/5 pr-2 mb-2 md:mb-0">
            <label class="block mb-1 text-xs">Coin / Currency:</label>
            <USelectMenu
              class="w-full"
              searchable
              v-model="selectedSymbols"
              :options="metadata?.symbolOrCurrencyLookup || []"
              placeholder="Select Coin / Currency"
              size="sm"
            >
              <template #label>
                <div
                  v-if="selectedSymbols"
                  class="flex justify-between w-full cursor-pointer"
                  @click.stop="onClearSymbol"
                >
                  <span class="truncate">{{ selectedSymbols }}</span>
                  <UIcon name="i-heroicons-x-mark-20-solid" class="text-xl" />
                </div>
              </template>
            </USelectMenu>
          </div>
          <div class="w-full md:w-1/4 lg:w-1/5 pr-2 mb-2 md:mb-0">
            <label class="block mb-1 text-xs">Date Range:</label>
            <div class="flex gap-1">
              <input
                v-model="startDate"
                class="w-1/2 border rounded-md p-1.5 text-xs"
                :min="$dayjs(metadata?.minFromDateUtc).format('YYYY-MM-DD')"
                type="date"
              />
              <input
                v-model="endDate"
                class="w-1/2 border rounded-md p-1.5 text-xs"
                :max="$dayjs(metadata?.maxToDateUtc).format('YYYY-MM-DD')"
                type="date"
              />
            </div>
          </div>
          <div class="flex-grow flex justify-end items-end">
            <UButton
              variant="outline"
              class="mr-2"
              size="xs"
              @click="clearSelections"
            >Clear</UButton>
            <UButton size="xs" @click="(currentPage = 1) && loadData()">Apply</UButton>
          </div>
        </div>
      </div>

      <div class="h-m-table lg:h-5/6">
        <UTable
          ref="table"
          v-model:sort="currentSort"
          :columns="columns"
          :rows="transactions"
          class="border dark:border-gray-700 rounded"
          sort-asc-icon="i-heroicons-arrow-up-20-solid"
          sort-desc-icon="i-heroicons-arrow-down-20-solid"
          :loading="metadataLoading"
          :ui="tableStyle"
        >

        <template #txDate-header="{ column }">
          <div class="flex items-center cursor-pointer" @click="setCurrentSort('txDate')">
            <DateTypeToggle v-model:modelValue="selectedDateType" :label="column.label" />
            <UIcon :name="getSortIcon('txDate')" class="ml-1 flex-shrink-0" />
          </div>
        </template>
        <template #symbol-header="{ column }">
          <div class="block items-center cursor-pointer" @click="setCurrentSort('symbol')">
            {{ column.label }}
            <UIcon :name="getSortIcon('symbol')" class="ml-1 flex-shrink-0" />
          </div>
        </template>
        <template #currency-header="{ column }">
          <div class="block items-center cursor-pointer" @click="setCurrentSort('currency')">
            {{ column.label }}
            <UIcon :name="getSortIcon('currency')" class="ml-1 flex-shrink-0" />
          </div>
        </template>
          <template #subExchangeName-data="{ row }">
            <UTooltip :text="row.subExchangeName" :popper="{ arrow: true }">
              <p class="truncate max-w-28">{{ row.subExchangeName }}</p>
            </UTooltip>
          </template>
          <template #txDate-data="{ row }">
          <span class="flex justify-center">{{ formatDate(getTxDate(row)) }}</span>
        </template>
          <template #txDateLocal-data="{ row }">
            <span class="flex justify-center">{{
              formatDate(row.txDateLocal)
            }}</span>
          </template>
          <template #orderNoUrl-data="{ row }">
            <div :class="[
              'truncate max-w-28 text-ellipsis whitespace-nowrap',
              isLargeScreen ? 'block' : 'hidden'
            ]">
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
          <template #tags-data="{ row }">
            <div :class="[
              'truncate max-w-28 text-ellipsis whitespace-nowrap',
              isLargeScreen ? 'block' : 'hidden'
            ]">
              {{ row.tags.join(", ") }}
            </div>
          </template>
          <template #symbol-data="{ row }">
            <div :class="['grid grid-cols-1 gap-1 px-1 w-full', getSymbolColorClass(row)]">              
              <UTooltip :text="`${row.qtyDisplay} ${row.symbol}`" :popper="{ arrow: true }">
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ row.qtyDisplay }} {{ row.symbol }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #currency-data="{ row }">
            <div :class="['grid grid-cols-1 gap-1 px-1 w-full', getCurrencyColorClass(row)]">
              <UTooltip :text="`${row.netDisplay} ${row.currency}`" :popper="{ arrow: true }">
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ row.netDisplay}} {{ row.currency }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #fee-data="{ row }">
            <div :class="['grid grid-cols-2 gap-1 px-1 w-full', getFeeColorClass(row)]">
              <div class="text-right whitespace-nowrap overflow-hidden text-ellipsis">{{ row.feeDisplay }}</div>
              <UTooltip :text="row.feeCoin" :popper="{ arrow: true }">
                <p class="whitespace-nowrap overflow-hidden text-ellipsis" :class="{ 'text-red-400': row.feeCoin?.length > 5 }">
                  {{ row.feeCoin ? row.feeCoin : "" }}
                </p>
              </UTooltip>
            </div>
          </template>
          <template #expandable-data="{ row }">
            <UButton
              v-if="isExpanderVisible(row)"
              @click="expandRow($event, row)"
              variant="ghost"
              size="xs"
              class="p-0 m-0"
            >
              <UIcon
                :name="
                  expandedElement === row.id
                    ? 'i-heroicons-chevron-up-20-solid'
                    : 'i-heroicons-chevron-down-20-solid'
                "
                class="text-xl"
              />
            </UButton>
          </template>
        </UTable>
      </div>
      <template #footer>
        <div class="w-full flex justify-between items-center">
          <div class="w-1/3"></div>
          <div class="w-1/3 flex justify-center">
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
          <div class="w-1/3 flex justify-end">
            <UButton variant="outline" @click="closeModal" 
            size="md" 
            class="px-6 py-1 text-base font-medium">Close</UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style>
.tx-date > div > div {
  display: flex;
}
</style>