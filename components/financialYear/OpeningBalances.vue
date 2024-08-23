<script lang="ts" setup>
import type { OpeningBalanceItem, } from "@/types/opening-balances";
import type OpeningBalancesSelectionModal from "@/components/financialYear/OpeningBalancesSelectionModal.vue";
import {
  ConfirmModal
} from "#components";
import { useScreenSize } from '@/composables/useScreenSize';
import { useUTableStyle } from '@/composables/useUTableStyle';
const { defaultPageSize } = useScreenSize();
const { tableStyle } = useUTableStyle();
const emit = defineEmits(["save-success"]);

const { $api } = useNuxtApp();
const modal = useModal();
const toast = useToast();
const currentSort: Ref<{
  column: string;
  direction: "desc" | "asc";
}> = ref({
  column: "",
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

const props = defineProps<{
  financialYearId: any;
}>();

const columns = computed(() => {
  return [
    {
      label: "Source",
      key: "source",
      sortable: true
    },
    {
      label: "Coin",
      key: "coin",
      sortable: true
    },
    {
      label: "Quantity",
      key: "qtyDisplay",
      tooltip: "Qty",
      class: 'bg-base-400'
    },
    {
      label: "Cost",
      key: "costDisplay",
      tooltip: "Cost",
      sortable: true
    },
    {
      label: "Bought Date",
      key: "boughtDate",
      class: "text-center",
      sortable: true
    },
    {
      key: "actions",
      label: "Actions",
      class: "text-center",
    },
  ];
});

const openingBalancesSelectionModal: Ref<InstanceType<
  typeof OpeningBalancesSelectionModal
> | null> = ref(null);
const openingBalanceList: Ref<OpeningBalanceItem[]> = ref([]);
const selectedOpeningBalances: Ref<OpeningBalanceItem[]> = ref([]);
const isOpeningBalanceLoading: Ref<boolean> = ref(true);

const currentPage: Ref<number> = ref(1);
const totalRecords: Ref<number> = ref(0);

const openingBalancesFilters: Ref<Record<any, any>[]> = ref([]);
const selectedOpeningBalanceFilters: Ref<any> = ref(null);

  const formatDateToLocal = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
const deleteSelectedItems = async () => {
  if (selectedOpeningBalances.value.length === 0) return;

  const payload = {
    openingBalanceIds: selectedOpeningBalances.value.map((coin) => coin.id),
  };

  modal.open(ConfirmModal, {
    title: `Are you sure you want to delete ${selectedOpeningBalances.value.length} selected items?`,
    async onConfirm() {
      const { data, error } = await $api.openingBalance.deleteOpeningBalances(
        {},
        props.financialYearId,
        payload
      );

      if (!error.value) {
        toast.add({
          title: "Selected items deleted successfully.",
        });
        loadData();
        selectedOpeningBalances.value = [];
      } else {
        toast.add({
          title: (error.value.data as any)?.title,
        });
      }
    },
  });
};


const loadData = async (isInitialLoad: boolean = false) => {
  isOpeningBalanceLoading.value = true;
  openingBalanceList.value = [];
  
  const orderBy = currentSort.value?.column === 'costDisplay'
    ? 'cost'
    : currentSort.value?.column === 'source'
    ? 'headerName'
    : currentSort.value?.column;

  const { data } = await $api.openingBalance.openingBalanceslist(
    {},
    props.financialYearId,
    {
      pageNo: currentPage.value,
      pageSize: defaultPageSize.value,
      ...(selectedOpeningBalanceFilters &&
        selectedOpeningBalanceFilters.value && {
          sourceId: selectedOpeningBalanceFilters.value?.id,
        }),
      ...(orderBy && {
        orderBy: orderBy,
      }),
      ...(currentSort?.value.direction && {
        orderByDirection: currentSort.value.direction,
      }),
    },
  );

  if (data.value) {
    openingBalanceList.value = (data.value as any).results.map((item: OpeningBalanceItem) => {
      return {
        ...item,
        boughtDate: formatDateToLocal(item.boughtDate),
      };
    }) as OpeningBalanceItem[];
    totalRecords.value = (data.value as any).total as number;
  }

  isOpeningBalanceLoading.value = false;
};

const clearFilters = () => {
  selectedOpeningBalanceFilters.value = null;
  currentPage.value = 1;
  loadData();
};

const loadFilters = async () => {
  const { data } = await $api.openingBalance.getOpeningBalancesFilters(
    {},
    props.financialYearId,
  );

  if (data.value) {
    openingBalancesFilters.value = Object.entries(
      (data.value as any).sourcesLookup,
    ).map(([key, value]) => ({
      id: parseInt(key, 10),
      label: value as string,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  }
};

const confirmDelete = (
  openingBalanceData: OpeningBalanceItem & { openingBalanceData: string },
) => {
  const payload = {
    openingBalanceIds:[openingBalanceData.id]
  }
  const title = `Are you sure you want to delete <span class="font-medium text-red-400">${openingBalanceData.source}</span> which includes cost $ ${openingBalanceData.cost}?`;
  modal.open(ConfirmModal, {
    title,
    async onConfirm() {
      const { data, error } = await $api.openingBalance.deleteOpeningBalances(
        {},
        props.financialYearId as number,
        payload
      );

      if (error.value) {
        toast.add({
          title: (error.value.data as any)?.title,
        });
      }
      loadData();
    },
  });
};

const onSaveSuccess = (data: string) => {
  emit("save-success", data);
  loadData();
};
const onOpeningBalancesImport = () => {

  if (!openingBalancesSelectionModal.value || !props.financialYearId)
    return;
    openingBalancesSelectionModal.value.openingBalanceSelectionModal(
    props.financialYearId
    );
};
const onClearSourceFilter = () => {
  selectedOpeningBalanceFilters.value = "";
  loadData();
};

const applyFilters = () => {
  currentPage.value = 1;
  loadData();
};

const clearSelections = () => {
  selectedOpeningBalanceFilters.value = null;
};

onMounted(async () => {
  loadData();
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
    <div class="flex justify-between items-end mb-4">
      <!-- Left side: Add Opening Balance button -->
      <div class="w-1/2 flex justify-start">
        <UButton
          @click="onOpeningBalancesImport"
          class="w-full sm:w-auto"
                color="primary"
        >
          <span>Add Opening Balance</span>
        </UButton>
      </div>
      
      <!-- Right side: Gray background search bar -->
      <!--<div class="w-1/2 bg-gray-200 dark:bg-gray-800 p-3 rounded-lg">
        <div class="flex flex-wrap items-end justify-between">
          <div class="w-full sm:w-2/3">
            <label for="sourcefilter" class="block mb-1 text-xs">Source:</label>
            <USelectMenu
              searchable
              id="sourcefilter"
              v-model="selectedOpeningBalanceFilters"
              :options="openingBalancesFilters"
              placeholder="Select source"
              class="w-full"
              size="sm"
            >
              <template #label>
                <div
                  v-if="selectedOpeningBalanceFilters?.label"
                  class="flex justify-between w-full cursor-pointer"
                  @click.stop="onClearSourceFilter"
                >
                  <span class="truncate">{{ selectedOpeningBalanceFilters.label }}</span>
                  <UIcon name="i-heroicons-x-mark-20-solid" class="text-xl" />
                </div>
              </template>
            </USelectMenu>
          </div>
          <div class="flex items-center mt-4 sm:mt-0">
            <UButton variant="soft" class="mr-2" size="sm" @click="clearFilters">Clear</UButton>
            <UButton size="sm" @click="applyFilters">Filter</UButton>
          </div>
        </div>
      </div>
      -->
    </div>

    <div class="">
      <UTable
        v-model="selectedOpeningBalances"
        v-model:sort="currentSort"
        :columns="columns"
        :rows="openingBalanceList"
        class="border dark:border-gray-700 rounded"
        :loading="isOpeningBalanceLoading"
        :ui="tableStyle"
      >
      <template #empty-state>
        <div class="flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <UIcon name="i-heroicons-circle-stack-20-solid" class="mb-4 w-8 h-8 text-primary-300" />
          <div class="flex flex-col sm:flex-row items-center text-sm text-gray-600">
            <p class="mb-2 sm:mb-0 sm:mr-2">No opening balances found.</p>
            <a
              href="#"
              @click.prevent="onOpeningBalancesImport"
              class="text-blue-500 hover:text-base-500 font-medium focus:outline-none underline"
            >
              Add Your Opening Balance
            </a>
          </div>
        </div>
      </template>
      <template #source-header="{ column }">
        <div class="flex items-center cursor-pointer" @click="setCurrentSort('source')">
          {{ column.label }}
          <UIcon :name="getSortIcon('source')" class="ml-1 flex-shrink-0" />
        </div>
      </template>
      <template #coin-header="{ column }">
        <div class="flex items-center cursor-pointer" @click="setCurrentSort('coin')">
          {{ column.label }}
          <UIcon :name="getSortIcon('coin')" class="ml-1 flex-shrink-0" />
        </div>
      </template>
      <template #boughtDate-header="{ column }">
        <div class="flex items-center cursor-pointer" @click="setCurrentSort('boughtDate')">
          {{ column.label }}
          <UIcon :name="getSortIcon('boughtDate')" class="ml-1 flex-shrink-0" />
        </div>
      </template>
      <template #costDisplay-header="{ column }">
        <div class="flex items-center cursor-pointer" @click="setCurrentSort('costDisplay')">
          {{ column.label }}
          <UIcon :name="getSortIcon('costDisplay')" class="ml-1 flex-shrink-0" />
        </div>
      </template>
      <template #qtyDisplay-data="{row}">
          <UTooltip :text='row.qtyDisplay' :popper="{ arrow: true }" class="text-green-500" >
             {{ row.qtyDisplay }}
          </UTooltip>
      </template>

      <template #costDisplay-data="{row}">
          <UTooltip :text='row.costDisplay' :popper="{ arrow: true }" class="text-red-500">
             {{ row.costDisplay }}
          </UTooltip>
      </template>

      <template #actions-data="{ row }">
        <div class="flex items-center ms-2">
          <UButton
            variant="soft"
            color="red"
            size="xs"
            @click="confirmDelete(row)"
          >
            Delete
          </UButton>
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

    <financial-year-opening-balances-selection-modal
        ref="openingBalancesSelectionModal"
        :financial-year-id="financialYearId"
        @save-success="onSaveSuccess"
    />
  </div>
</template>

<style scoped>
.inline-lable-source {
  display: flex;
  align-items: center;
}
:deep(tbody tr td:first-child) {
  width: 40px;
}

:deep(thead tr th:first-child) {
  background: #e5e7eb !important;
}
</style>