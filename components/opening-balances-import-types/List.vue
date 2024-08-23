<script lang="ts" setup>
import type { OpeningBalancesImportType } from "@/types/opening-balances"
import type { Ref } from "vue";

const { $api } = useNuxtApp();

const props = defineProps<{
  isDashboard?: boolean;
  isModal?: boolean;
  financialYearId: any;
}>();

const emits = defineEmits(["open-balance-selection"]);

const isLoading = ref(true);
const openingBalanceImportList: Ref<OpeningBalancesImportType[]> = ref([]);

const getFilteredList = computed(() => {
  return [...openingBalanceImportList.value];
});

const getOBalanceImportList = async () => {
  try {
    const { data } = await $api.openingBalance.getOpeningBalancesImportType(
      {},
    props.financialYearId,
    {
      
    },
    );
    if (data.value) {
      openingBalanceImportList.value = data.value;
    }
  } catch (e) {
    console.log(e);
  } finally {
    isLoading.value = false;
  }
};

const oBalanceSelection = (openingBalanceImportType: OpeningBalancesImportType) => {
  emits("open-balance-selection", openingBalanceImportType);
};

onMounted(() => {
  getOBalanceImportList();
});
</script>
<template>
  <section
    :class="{
      'mt-0 mb-10 md:mt-10 md:mb-20 pt-10': !isModal,
      'my-5': isModal,
    }"
  >
    <div
      v-if="!isLoading && getFilteredList.length === 0"
      class="container mx-auto text-center w-full text-blue-600 mt-4 lg:mt-0 max-w-xl"
    >
      <UAlert
        icon="i-heroicons-command-line"
        color="blue"
        variant="outline"
        title="Not found. Please use the 'Custom Csv' import option to import
      the data."
      />
    </div>
    <div
      class="container mx-auto grid text-center h-96 p-5 md:p-10 lg:p-0 auto-rows-min"
      :class="{
        'h-auto xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 grid-cols-1 gap-4':
          isDashboard,
        'h-96 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 grid-cols-1 gap-4':
          !isDashboard && !isModal,
        'h-3xl xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid-cols-1 gap-4 overflow-y-auto':
          isModal,
      }"
    >
      <opening-balances-loader v-if="isLoading" v-for="i in 4" :key="i" />
      <div
        v-for="importType in getFilteredList"
        class="bg-base-50 border border border-base-400 text-base-400 p-3 focus:outline-none hover:bg-base-100 dark:bg-primary-50-dark rounded text-sm mb-2 lg:mb-0 grid content-center px-2 py-4"
        
        :class="{ 'cursor-pointer': isModal }"
        :key="importType.openingBalanceImportTypeId"
        @click="oBalanceSelection(importType)"
      >
        <!-- service block -->
        <div class="flex items-center ps-2">
          <div class="text-gray-900 flex items-center">
          </div>
          <!-- Change text-md to  -->
          <h3
            class="text-md leading-normal font-semibold text-black dark:text-white text-opacity-90 col-span-4 text-left ms-2"
          >
            {{ importType.importName }}
          </h3>
        </div>
        <!-- service block -->
      </div>
    </div>
  </section>
</template>
