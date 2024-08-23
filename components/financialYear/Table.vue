<script lang="ts" setup>
import {
  ConfirmModal,
  FinancialYearTransactionHistoryDetailsModal,
} from "#components";
import {
  useSignalR,
  type NotificationResponse,
} from "@/composables/useSignalR";
import type { TransactionImport } from "@/types/exchanges";
import { useUTableStyle } from '@/composables/useUTableStyle';
const { tableStyle } = useUTableStyle();

const { $api } = useNuxtApp();
const { notificationResponse } = useSignalR();
const modal = useModal();
const toast = useToast();

const columns = [
  {
    key: "exchangeImportTypeName",
    label: "Exchange import type",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "txCount",
    label: "Tx Count",
    sortable: true,
    align: "right",
    class: 'text-right'
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
  },
  {
    key: "statusDetails",
    label: "Status Details",
    sortable: false,
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    class: "text-center",
  },
];

const props = defineProps<{
  financialYearId: number | null | undefined;
  transactionImportData: TransactionImport[] | null;
}>();

const txHistorySources: Ref<TransactionImport[]> = ref([]);
const txHistorySourcesLoading = ref(false);
const refechedTransctionsList: Ref<string[]> = ref([]);

const getTxHistorySources = async () => {
  try {
    txHistorySourcesLoading.value = true;
    const { data } = await $api.txHistorySources.getTxHistorySources(
      { server: false },
      props.financialYearId as number,
    );

    if (data.value) {
      txHistorySources.value = data.value as any;
    }
  } catch (e) {
    console.log(e);
  } finally {
    txHistorySourcesLoading.value = false;
  }
};

const getProgress = computed(() => (eId: string) => {
  const progress = notificationResponse.value.filter(
    (item: NotificationResponse) => (item as any).externalIdentifier === eId,
  );

  if (progress.length > 0) {
    return (progress[0] as any).progressPerc;
  }

  return 0;
});

const getNotes = computed(() => (eId: string) => {
  const progress = notificationResponse.value.filter(
    (item: NotificationResponse) => (item as any).externalIdentifier === eId,
  );

  if (progress.length > 0) {
    return progress[0].message;
  }

  return undefined;
});

const getStatusColor = computed(() => (status: string) => {
  let color = "";

  switch (status) {
    case "Success":
      color = "green";
      break;
    case "Queued":
      color = "blue";
      break;
    case "Failed":
    case "Transaction Limit Exceeded":
      color = "red";
  }

  return color;
});

const confirmDelete = (
  txHistorySource: TransactionImport & { exchangeImportTypeName: string },
) => {
  const title = `Are you sure you want to delete <span class="font-medium text-red-400">${txHistorySource.exchangeImportTypeName}</span> which includes ${txHistorySource.txCount} transactions?`;
  modal.open(ConfirmModal, {
    title,
    async onConfirm() {
      txHistorySourcesLoading.value = true;
      const { data, error } = await $api.txHistorySources.deleteTxHistorySource(
        {},
        props.financialYearId as number,
        txHistorySource.externalIdentifier,
      );

      if (error.value) {
        toast.add({
          title: (error.value.data as any)?.title,
        });
        txHistorySourcesLoading.value = false;
      }
      await getTxHistorySources();
    },
  });
};

const openTransactionHistoryDetailModal = (
  txHistorySource: TransactionImport,
) => {
  modal.open(FinancialYearTransactionHistoryDetailsModal, {
    externalIdentifier: txHistorySource.externalIdentifier,
    userFYearId: props.financialYearId as number,
  });
};

const requeueTransaction = async (txHistorySource: TransactionImport) => {
  const {data, error} =
      await $api.txHistoryImportExchange.requeueTxHistorySource(
          {
            server: false
          },
          props.financialYearId as number,
          txHistorySource.externalIdentifier);

  if (data.value) {
    const updatedTransaction = data.value;
    const index = txHistorySources.value.findIndex(
        (item) => item.externalIdentifier === txHistorySource.externalIdentifier
    );

    if (index !== -1) {
      txHistorySources.value[index] = updatedTransaction;
    }
  }
};


watch(
  () => props.transactionImportData,
  () => {
    if (props.transactionImportData && Array.isArray(props.transactionImportData) && props.transactionImportData.length > 0) {
      {
        props.transactionImportData.forEach(item => {
          //if (item.refresh) {
          //  debugger;
          //  getTxHistorySources();
          //} else {
            txHistorySources.value.unshift(item);
          //}
        });
      }
    }
  },
  { immediate: true },
);

watch(
  notificationResponse,
  async () => {
    const completedTransactionIds: string[] = [];

    notificationResponse.value.forEach((notificationItem) => {
      if (notificationItem.progressPerc === 100) {
        completedTransactionIds.push(notificationItem.externalIdentifier);
      }
    });

    [...new Set(completedTransactionIds)].forEach(async (item: string) => {
      if (!refechedTransctionsList.value.includes(item)) {
        refechedTransctionsList.value.push(item);

        const { data } = await $api.txHistorySources.getTxHistorySource(
          { server: false },
          props.financialYearId as number,
          item,
        );

        if (data.value && data.value.length > 0) {
          const source = data.value[0];
          const sourceIndex = txHistorySources.value.findIndex(
            (item) =>
              item.externalIdentifier === (source as any).externalIdentifier,
          );

          if (sourceIndex !== -1) {
            txHistorySources.value[sourceIndex] = source as any;
          }
        }
      }
    });
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  getTxHistorySources();
});
</script>
<template>
  <div class="">
    <UTable
      :columns="columns"
      :rows="txHistorySources"
      :loading="txHistorySourcesLoading"
      class="border dark:border-gray-700 rounded"
      :ui="tableStyle"
    >
 
      <template #exchangeImportTypeName-data="{ row }">    
            <UButton
          variant="link"
          class="text-black underline p-1"
          @click="openTransactionHistoryDetailModal(row)"
        >
        <img
              v-if="row.exchangeLogoUrl"
              :src="row.exchangeLogoUrl"
              class="h-5 w-5"
            />
          {{ row.exchangeImportTypeName }}
        </UButton>
      </template>
      <template #status-data="{ row }">
        <div
          v-if="
            row.canDisplayProgress && getProgress(row.externalIdentifier) > 0
          "
        >
          <UProgress
            v-show="getProgress(row.externalIdentifier) < 100"
            size="lg"
            :value="Number(getProgress(row.externalIdentifier))"
            :ui="{
              progress: {
                rounded: 'rounded-md [&::-webkit-progress-bar]:rounded-md',
              },
            }"
          />
          <UBadge
            v-show="getProgress(row.externalIdentifier) >= 100"
            size="sm"
            :label="'Completed'"
            :color="'emerald'"
            variant="subtle"
          />
        </div>
        <div
          v-if="
            !row.canDisplayProgress || getProgress(row.externalIdentifier) === 0
          "
        >
          <span :style="{color: getStatusColor(row.status) }">{{ row.status }}</span>
          &nbsp;
          <UButton
              v-if="row.canRequeue === true"
              variant="soft"
              :color="getStatusColor('Queued')"
              :style="{ color: getStatusColor('Queued') }"
              size="xs"
              @click="requeueTransaction(row)"
          >
            Retry
          </UButton>
        </div>
      </template>
      <template #statusDetails-data="{ row }">
        <div v-if="getNotes(row.externalIdentifier)">
          {{ getNotes(row.externalIdentifier) }}
        </div>
        <div v-else>
          <span v-if="row.statusDetails.length < 100">{{
            row.statusDetails
          }}</span>
          <UTooltip
            v-else
            :text="row.statusDetails"
            :popper="{ placement: 'top' }"
          >
            <p class="cursor-pointer">
              {{ row.statusDetails.substring(0, 99) }}
            </p>
          </UTooltip>
        </div>
      </template>
      <template #actions-data="{ row }">
        <div class="flex items-center ms-2">
          <UButton
            variant="soft"
            class="me-2"
            size="xs"
            @click="openTransactionHistoryDetailModal(row)"
          >
            View
          </UButton>
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
</template>
