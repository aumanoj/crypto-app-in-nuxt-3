<script lang="ts" setup>
import type ErrorNotifier from "@/components/global/ErrorNotifier.vue";
import type { SelfImport } from "@/types/opening-balances";
import type { ErrorObject } from "~/types/api-instance";

const { $api } = useNuxtApp();

const props = defineProps<{
  selfImportConfig: SelfImport;
  financialYearId: any;
}>();
const emit = defineEmits(["save-success"]);

const selfImportLoader = ref(false);
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);

const onImportWallet = async () => {
  try {
    const { openingBalanceImportTypeId } = props.selfImportConfig;
    const userFYearId = props.financialYearId;

    if (!userFYearId || !openingBalanceImportTypeId) return;
    selfImportLoader.value = true;
    const { data, error} =
      await $api.openingBalance.openingBalancesImportFiles({},
        {
          userFYearId,
          openingBalanceImportTypeId
        }
      );
      if(data.value){
        emit("save-success", "success");
      }
      else if (error.value) {
        errorNotifier.value?.show(error.value as ErrorObject);
      }
    } catch (error) {
      console.log(error);
    } finally {
      selfImportLoader.value = false;
  }
};
</script>

<template>
  <div class="rounded-lg mb-8">
    <div class="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <div class="mb-4 -mt-4 relative">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-md px-2 text-gray-700 dark:text-gray-400 text-lg font-medium absolute -top-4 -left-2">
          <span>{{ selfImportConfig.importName }}</span>
        </div>
      </div>
      <p
        v-html="selfImportConfig.importHtmlDescription"
        class="mt-2 text-sm text-gray-600 [&>p]:mt-1 [&_a]:text-blue-700"
      />
      <ErrorNotifier ref="errorNotifier" />
      <div class="flex justify-end w-full">
        <button
          @click="onImportWallet"
          class="bg-base-400 border border-base-400 md:border-0 py-3 px-6 focus:outline-none hover:bg-base-500 rounded text-white md:mt-2 text-sm mt-2 grow-0 max-w-24"
        >
          <span>Import</span>
        </button>
      </div>
      <loader :loading="selfImportLoader" />
    </div>
  </div>
</template>
