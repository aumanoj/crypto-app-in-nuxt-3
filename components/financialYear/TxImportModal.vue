<script lang="ts" setup>
import type {
  ApiImport,
  CsvImport,
  ImportConfig,
  EmittedTransactionImportData,
  WalletAddressImport,
} from "@/types/exchanges";

const tabNamesMap = {
  CSV: "CSV Import",
  Address: "Wallet Import",
  API: "Api Import",
};

const { $api } = useNuxtApp();
const emit = defineEmits(["save-success", "tx-modal-close"]);

const isOpen = ref(false);
const exchangeId: Ref<number | null> = ref(null);
const userFinancialYearId: Ref<number | null> = ref(null);
const exchangeImportConfigMap: Ref<{ [key: string]: ImportConfig[] }> = ref({});
const exchangeImportConfigLoader: Ref<boolean> = ref(false);

const tabs = computed(() => {
  if (!exchangeImportConfigMap.value) return [];

  return Object.values(exchangeImportConfigMap.value).map((importItem) => {
    return {
      label: tabNamesMap[importItem?.[0].importType],
      name: importItem?.[0].importType,
    };
  });
});

const getCsvImportConfig = computed(() => (configKey: string) => {
  return exchangeImportConfigMap.value[configKey] as CsvImport[];
});

const getWalletAddressImportConfig = computed(() => (configKey: string) => {
  return exchangeImportConfigMap.value[configKey] as WalletAddressImport[];
});

const getApiImportConfig = computed(() => (configKey: string) => {
  return exchangeImportConfigMap.value[configKey] as ApiImport[];
});

const openTxImportModal = (eId: number, financialYearId: number | null) => {
  isOpen.value = true;
  exchangeId.value = eId;
  userFinancialYearId.value = financialYearId;
  getImportConfiguration();
};

const getImportConfiguration = async () => {
  if (!exchangeId.value || !userFinancialYearId.value) return;

  try {
    exchangeImportConfigLoader.value = true;
    exchangeImportConfigMap.value = {};
    const { data } = await $api.exchange.getExchangeImportConfig(
      {
        server: false,
      },
      exchangeId.value,
      userFinancialYearId.value,
    );

    if (data.value) {
      data.value.forEach((importItem) => {
        const isConfigEmpty =
          exchangeImportConfigMap.value[importItem.importType];

        if (!isConfigEmpty) {
          exchangeImportConfigMap.value[importItem.importType] = [
            { ...importItem },
          ];
        } else {
          exchangeImportConfigMap.value[importItem.importType].push({
            ...importItem,
          });
        }
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    exchangeImportConfigLoader.value = false;
  }
};

const onSaveSuccess = (data: EmittedTransactionImportData) => {
  emit("save-success", data);

  //if (data.close === false && data.refresh === true) {
  if (data.close === false) {
    isOpen.value = false;
  }

  if (data.close !== false) {
    isOpen.value = false;
  }
};

const onCloseModal = () => {
  emit("tx-modal-close");
};

const getContentHeight = computed(() => (tabName: string) => {
  return tabName === 'CSV' ? 'h-auto' : 'h-[28rem]';
});

defineExpose({
  openTxImportModal,
});
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      :ui="{
        width: 'w-full sm:max-w-7xl',
      }"
      @close="onCloseModal"
    >
      <UCard
        :ui="{
          ring: '',
          footer: {
            padding: 'py-4',
          },
        }"
        class="relative"
      >
        <loader :loading="exchangeImportConfigLoader" />

        <Tabs :tabs="tabs" :content-height="getContentHeight(tabs[0]?.name)">
          <template v-for="{ name } in tabs" v-slot:[`${name}`]>
            <div v-for="(_config, i) in exchangeImportConfigMap[name]" :key="i">
              <template v-if="name === 'CSV'">
                <financial-year-csv-import
                  v-for="(csvConfig, i) in getCsvImportConfig(name)"
                  :key="`csv-import-${i}`"
                  :csv-import-config="csvConfig"
                  class="mt-4"
                  :is-multiple="getCsvImportConfig(name).length > 1"
                  @save-success="onSaveSuccess"
                />
              </template>
              <template v-if="name === 'Address'">
                <financial-year-wallet-address-import
                  v-for="(walletConfig, i) in getWalletAddressImportConfig(
                    name,
                  )"
                  :key="`wallet-import-${i}`"
                  :wallet-address-import-config="walletConfig"
                  class="mt-4"
                  @save-success="onSaveSuccess"
                />
              </template>
              <template v-if="name === 'API'">
                <financial-year-api-import
                  v-for="(apiConfig, i) in getApiImportConfig(name)"
                  :key="`api-import-${i}`"
                  :api-import-config="apiConfig"
                  class="mt-4"
                  @save-success="onSaveSuccess"
                />
              </template>
            </div>
          </template>
        </Tabs>

        <template #footer>
          <div class="w-full grid justify-items-end content-center">
            <button
              @click="onSaveSuccess({ close: false, refresh: true } as any)"
              class="border border-base-400 py-1 px-4 focus:outline-none rounded text-primary text-sm grow-0 max-w-24"
            >
              <span>Close</span>
            </button>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>