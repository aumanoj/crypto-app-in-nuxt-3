<script lang="ts" setup>
import type {
  // TransactionImport,
} from "@/types/exchanges";
import type {CsvImport,
  OpeningBalancesImportType,
  ImportConfig,
  SelfImport,
  OpeningBalanceItem 
} from "@/types/opening-balances"

const tabNamesMap = {
  CSV: "Import csv file",
  self: "Self Import"
};
const emit = defineEmits(["save-success", "tx-modal-close"]);

const isOpen = ref(false);
const openingBalanceImportTypeId: Ref<number | null> = ref(null);
const userFinancialYearId: Ref<number | null> = ref(null);
const openingBalancesImportConfigLoader: Ref<boolean> = ref(false);
const openingBalancesImportConfigMap = ref<{ [key: string]: ImportConfig[] }>({});

const tabs = computed(() => {
  if (!openingBalancesImportConfigMap.value) return [];
  return Object.values(openingBalancesImportConfigMap.value).map((importItem) => {
    return {
      label: tabNamesMap[importItem?.[0].importType],
      name: importItem?.[0].importType,
    };
  });
});

const getCsvImportConfig = computed(() => (configKey: string) => {
  return openingBalancesImportConfigMap.value[configKey] as CsvImport[];
});

const getSelfImportConfig = computed(() => (configKey: string) => {
  return openingBalancesImportConfigMap.value[configKey] as SelfImport[];
});

const openBalImportModal = (opBalanceImportType: OpeningBalancesImportType, financialYearId: number | null) => {
  isOpen.value = true;
  openingBalanceImportTypeId.value = opBalanceImportType.openingBalanceImportTypeId;
  userFinancialYearId.value = financialYearId;
  openingBalancesImportConfigMap.value = {};
  setExchangeImportConfig(opBalanceImportType);
};

const setExchangeImportConfig = (data: OpeningBalancesImportType) => {
  const importType = data.importType;
  if (!openingBalancesImportConfigMap.value[importType]) {
    openingBalancesImportConfigMap.value[importType] = [];
  }

  openingBalancesImportConfigMap.value[importType].push({
    openingBalanceImportTypeId: data.openingBalanceImportTypeId,
    importType: data.importType,
    importName: data.importName,
    importHtmlDescription: data.importHtmlDescription,
    csvSettings: {
      allowChangeDateTimezoneType: data.csvSettings?.allowChangeDateTimezoneType,
      defaultDateTimezoneType: data.csvSettings?.defaultDateTimezoneType
    }
  });
};


const onSaveSuccess = (data: OpeningBalanceItem) => {
  emit("save-success", data);
  if (data.close === false && data.refresh === true) {
    isOpen.value = false;
  }
  if (data.close !== false) {
    isOpen.value = false;
  }
};

const onCloseModal = () => {
  emit("tx-modal-close");
  openingBalancesImportConfigMap.value = {};
};

defineExpose({
  openBalImportModal,
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
        <loader :loading="openingBalancesImportConfigLoader" />
        <Tabs :tabs="tabs">
          <template v-for="{ name } in tabs" v-slot:[`${name}`]>
              <template v-if="name === 'CSV'">
                <div v-for="(csvConfig, i) in getCsvImportConfig(name)" :key="`csv-import-${i}`">
                  <financial-year-opening-balances-csv-import
                    :csv-import-config="csvConfig"
                    class="mt-4"
                    :financial-year-id="userFinancialYearId"
                    :is-multiple="getCsvImportConfig(name).length > 1"
                    @save-success="onSaveSuccess"
                  />
                </div>
              </template>
              <template v-else>
                <div  v-for="(selfConfig, i) in getSelfImportConfig(name)" :key="`self-import-${i}`">
                  <financial-year-opening-balances-self-import
                    :financial-year-id="userFinancialYearId"
                    :self-import-config="selfConfig"
                    class="mt-4"
                    @save-success="onSaveSuccess"
                  />
                </div>
              </template>
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
