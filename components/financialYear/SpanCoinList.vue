<script lang="ts" setup>
import { useSignalR } from "@/composables/useSignalR";
import type { CoinInfo } from "@/types/spam-coin";
import { v4 as uuidv4 } from "uuid";
import DOMPurify from 'dompurify';
import { useScreenSize } from '@/composables/useScreenSize';
import { useUTableStyle } from '@/composables/useUTableStyle';
const { tableStyle } = useUTableStyle();
const { $api } = useNuxtApp();
const { spamCoinLoadProgress } = useSignalR();

const props = defineProps<{
  financialYearId: any;
}>();

const columns = computed(() => {
  return [
    {
      label: "Coin",
      key: "logoUrl",
    },
    {
      label: "Coin Name",
      key: "coinName",
    },
    {
      label: "Contract Address",
      key: "coinContractAddress",
    },
    {
      label: "Exchange",
      key: "exchangeName",
    },
    {
      label: "Spam Status",
      key: "actions",
      class: "text-center",
    },
    {
      label: "",
      key: "expandable",
    },
  ];
});

const spamCoinList: Ref<CoinInfo[]> = ref([]);
const selectedCoins: Ref<CoinInfo[]> = ref([]);
const isSpamCoinsLoading: Ref<boolean> = ref(true);

const currentPage: Ref<number> = ref(1);
const { defaultPageSize } = useScreenSize();
const totalRecords: Ref<number> = ref(0);
const expandedElement: Ref<number> = ref(0);

const exchangeFilters: Ref<Record<any, any>[]> = ref([]);
const selectedExchangeFilters: Ref<any> = ref(null);
const spamAnalysisFilters: Ref<Record<any, any>[]> = ref([]);
const selectedSpamAnalysisFilters: Ref<any> = ref({
  label: "Include in Tax",
  id: 0,
});

const markSelectedCoinsAsSpam = () => {
  const payload = selectedCoins.value.map((coin) => ({
    exchangeId: coin.exchangeId,
    coin: coin.coin,
    coinContractAddress: coin.coinContractAddress,
    isSpam: true,
    uuid: coin.uuid,
  }));

  markCoinsAsSpam(payload);
};

const onMarkSingleCoin = (spamCoin: CoinInfo & { uuid: string }) => {
  const payload = [
    {
      exchangeId: spamCoin.exchangeId,
      coin: spamCoin.coin,
      coinContractAddress: spamCoin.coinContractAddress,
      isSpam: !spamCoin.markedAsSpam,
      uuid: spamCoin.uuid,
    },
  ];

  markCoinsAsSpam(payload);
};

const markCoinsAsSpam = async (
  spamCoins: {
    exchangeId: number;
    coin: string;
    coinContractAddress: string;
    isSpam: boolean;
    uuid?: string;
    expandedContent?: string;
  }[],
) => {
  const { data, error } = await $api.txSpamCoin.markCoinAsSpam(
    {},
    props.financialYearId,
    spamCoins,
  );

  if (!error.value) {
    spamCoins.forEach((spamCoin) => {
      const coinIndex = spamCoinList.value.findIndex((coin) => {
        return coin.uuid === spamCoin.uuid;
      });
      if (coinIndex !== -1) {
        spamCoinList.value[coinIndex] = {
          ...spamCoinList.value[coinIndex],
          markedAsSpam: !spamCoinList.value[coinIndex].markedAsSpam,
        };
      }
    });

    selectedCoins.value = [];
  }
};

const loadData = async (isInitialLoad: boolean = false) => {
  isSpamCoinsLoading.value = true;
  spamCoinList.value = [];
  selectedCoins.value = [];
  const { data } = await $api.txSpamCoin.getSpamCoinList(
    {},
    props.financialYearId,
    {
      pageNo: currentPage.value,
      pageSize: defaultPageSize.value,
      ...(selectedExchangeFilters &&
        selectedExchangeFilters.value && {
          exchangeId: selectedExchangeFilters.value?.id,
        }),
      ...(selectedSpamAnalysisFilters &&
        selectedSpamAnalysisFilters.value && {
          spamAnalysis: selectedSpamAnalysisFilters.value?.id,
        }),
      reload: isInitialLoad ? "true" : "false",
    },
  );

  if (data.value) {
    spamCoinList.value = (data.value as any).results.map((coin: CoinInfo) => ({
      ...coin,
      uuid: uuidv4(),
    })) as CoinInfo[];
    totalRecords.value = (data.value as any).total as number;
  }

  isSpamCoinsLoading.value = false;
};

const clearFilters = () => {
  selectedExchangeFilters.value = null;
  selectedSpamAnalysisFilters.value = null;
  currentPage.value = 1;
  loadData();
};

const loadFilters = async () => {
  const { data } = await $api.txSpamCoin.getSpamCoinFilters(
    {},
    props.financialYearId,
  );

  if (data.value) {
    exchangeFilters.value = Object.entries(
      (data.value as any).exchangesLookup,
    ).map(([key, value]) => ({
      id: parseInt(key, 10),
      label: value,
    }));
    spamAnalysisFilters.value = Object.entries(
      (data.value as any).spamAnalysis,
    ).map(([key, value]) => ({
      id: parseInt(key, 10),
      label: value,
    }));
  }
};

const expandRow = async (event: Event, row: any, isClosing: boolean) => {
  // Remove currently expanded element if it exists
  if (expandedElement.value) {
    const el = document.getElementById(String(expandedElement.value));
    el?.remove();
    if (expandedElement.value === row.uuid) {
      expandedElement.value = 0;
      if (isClosing) return; // Exit if we're just closing the expanded row
    }
  }

  // If we're not closing and the row doesn't have expanded content, fetch it
  if (!isClosing && !row.expandedContent) {
    try {
      const { data } = await $api.txHistoryImportExchange.getTransactionsByIdentifiers(
        {},
        props.financialYearId,
        row.exchangeId,
        [row.firstBuyTxIdentifier, row.firstSellTxIdentifier].filter(Boolean),
      );

      if (data.value) {
        const firstBuy = (data.value as any).find((r: any) => r.identifier === row.firstBuyTxIdentifier);
        const firstSell = (data.value as any).find((r: any) => r.identifier === row.firstSellTxIdentifier);
        
        const processedSummaryLines = (summaryLines: string[] = []) => summaryLines.map(processText);

        row.expandedContent = `
          <tr id="${row.uuid}" class="whitespace-nowrap">
            <td colspan="${columns.value.length}" class="p-4 text-sm">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 class="font-semibold mb-2 text-gray-700 dark:text-gray-300">First Buy</h3>
                  ${firstBuy 
                    ? `<p class="whitespace-pre-wrap text-gray-600 dark:text-gray-400">${DOMPurify.sanitize(processedSummaryLines(firstBuy.summaryLines).join("\n"))}</p>`
                    : `<p class="text-gray-500 dark:text-gray-400 italic">No first buy transaction available</p>`
                  }
                </div>
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 class="font-semibold mb-2 text-gray-700 dark:text-gray-300">First Sell</h3>
                  ${firstSell
                    ? `<p class="whitespace-pre-wrap text-gray-600 dark:text-gray-400">${DOMPurify.sanitize(processedSummaryLines(firstSell.summaryLines).join("\n"))}</p>`
                    : `<p class="text-gray-500 dark:text-gray-400 italic">No first sell transaction available</p>`
                  }
                </div>
              </div>
            </td>
          </tr>
        `;
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      return; // Exit if we couldn't fetch the data
    }
  }

  // Insert the expanded content
  if (row.expandedContent) {
    const currentRow = (event.target as HTMLElement).closest("tr") as HTMLTableRowElement;
    currentRow.insertAdjacentHTML("afterend", row.expandedContent);

    // Parse the inserted HTML to render links correctly
    // This is necessary because insertAdjacentHTML doesn't parse HTML entities
    const insertedRow = document.getElementById(row.uuid);
    if (insertedRow) {
      insertedRow.innerHTML = insertedRow.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    expandedElement.value = row.uuid;
  }
};

onMounted(async () => {
  loadData(true);
  loadFilters();
});

function processText(text: string): string {
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi;

  return text.replace(linkRegex, (match, href, linkText) => {
    // Use decodeURIComponent instead of he.decode
    const decodedHref = decodeURIComponent(href);
    const decodedText = decodeURIComponent(linkText);
    const safeUrl = encodeURI(decodedHref);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${decodedText}</a>`;
  });
}

</script>
<template>
  <div>
    <div class="flex flex-col mb-4">
      <!-- Top: Add Mark as spam button -->
      <div class="mb-4">
        <UButton
          v-if="selectedCoins.length > 0"
          class="w-full sm:w-auto"
          color="primary"
          @click="markSelectedCoinsAsSpam"
        >
          Mark {{ selectedCoins.length }} selected coins as spam
        </UButton>
      </div>
      
      <!-- Full width search bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-grow flex items-center">
            <label class="mr-2 text-sm whitespace-nowrap">Exchange:</label>
            <USelectMenu
              v-model="selectedExchangeFilters"
              :options="exchangeFilters"
              placeholder="Select exchange"
              size="sm"
              class="flex-grow"
            />
          </div>
          <div class="flex-grow flex items-center">
            <label class="mr-2 text-sm whitespace-nowrap">Spam Status:</label>
            <USelectMenu
              v-model="selectedSpamAnalysisFilters"
              :options="spamAnalysisFilters"
              placeholder="Select spam status"
              size="sm"
              class="flex-grow"
            >
              <template #label>
                <div v-if="selectedSpamAnalysisFilters?.label" class="flex justify-between w-full">
                  <span class="truncate">{{ selectedSpamAnalysisFilters.label }}</span>
                  <UIcon 
                    name="i-heroicons-x-mark-20-solid" 
                    class="text-xl cursor-pointer" 
                    @click.stop="selectedSpamAnalysisFilters = null; loadData()"
                  />
                </div>
              </template>
            </USelectMenu>
          </div>
          <div class="flex items-center">
            <UButton
              variant="outline"
              class="mr-2"
              size="xs"
              @click="clearFilters()"
            >Clear</UButton>
            <UButton 
              size="xs" 
              @click="currentPage = 1; loadData()"
            >Apply</UButton>
          </div>
        </div>
      </div>
    </div>  

  
    <div class="">
      <UTable
        v-model="selectedCoins"
        :columns="columns"
        :rows="spamCoinList"
        class="border dark:border-gray-700 rounded"
        :loading="isSpamCoinsLoading"
        :ui="tableStyle"
      >
        <template #loading-state>
          <div
            class="flex flex-col justify-center items-center mx-auto text-center max-w-56 h-[300px]"
          >
            <span class="block mb-5">{{ spamCoinLoadProgress?.message }}</span>
            <UProgress
              size="lg"
              :value="spamCoinLoadProgress?.progressPerc"
              :ui="{
                progress: {
                  rounded: 'rounded-md [&::-webkit-progress-bar]:rounded-md',
                },
              }"
            />
          </div>
        </template>
        <template #logoUrl-data="{ row }">
          <div class="flex items-center">
            <img
              v-if="row.logoBase64String"
              :src="`data:image/png;base64,${row.logoBase64String}`"
              class="h-6 w-6 me-4"
            />
            <UTooltip :text="row.coin" :popper="{ arrow: true }">
              <p class="truncate max-w-80">{{ row.coin }}</p>
            </UTooltip>
          </div>
        </template>
        <template #possibleSpam-data="{ row }">
          <span
            class="block w-full text-center"
            :class="{ 'text-red-400': row.possibleSpam }"
            >{{ row.possibleSpam ? "Yes" : "Not spam" }}</span
          >
        </template>
        <template #actions-data="{ row }">
          <div class="flex items-center justify-center space-x-2">
            <span class="text-xs" :class="row.markedAsSpam ? 'text-red-500' : 'text-green-500'">
              {{ row.markedAsSpam ? 'Spam (Ignore)' : 'Include in Tax' }}
            </span>
            <UToggle
              on-icon="i-heroicons-x-mark-20-solid"
              off-icon="i-heroicons-check-20-solid"
              :model-value="row.markedAsSpam"
              :ui="{
                active: 'bg-red-500 dark:bg-red-500',
                inactive: 'bg-green-500 dark:bg-green-500',
              }"
              @change="onMarkSingleCoin(row)"
            />
          </div>
        </template>
        <template #expandable-data="{ row }">
          <UButton
            @click="expandRow($event, row, expandedElement === row.uuid)"
            variant="ghost"
            size="xs"
            class="p-0"
            v-if="row.firstBuyTxIdentifier || row.firstSellTxIdentifier"
          >
            <UIcon
              :name="
                expandedElement === row.uuid
                  ? 'i-heroicons-chevron-up-20-solid'
                  : 'i-heroicons-chevron-down-20-solid'
              "
              class="text-xl"
            />
          </UButton>
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
<style scoped>
:deep(tbody tr td:first-child) {
  width: 40px;
}

:deep(thead tr th:first-child) {
  background: #e5e7eb !important;
}

.h-spam-coin-stepper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

:deep(.h-spam-coin-stepper > div) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

:deep(.h-spam-coin-stepper table) {
  flex-grow: 1;
}
</style>
