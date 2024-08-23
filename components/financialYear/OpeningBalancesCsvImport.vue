<script lang="ts" setup>
import type ErrorNotifier from "@/components/global/ErrorNotifier.vue";
import type { OpeningBalancesImportType } from "@/types/opening-balances"
import { z } from "zod";
import type { ErrorObject } from "~/types/api-instance";

const { $api } = useNuxtApp();

const props = defineProps<{
  csvImportConfig: OpeningBalancesImportType;
  isMultiple: boolean; 
  financialYearId: any;
}>();
const emit = defineEmits(["save-success"]);

const isTimezoneChangeAllowed = computed(() => {
  return props.csvImportConfig?.csvSettings?.allowChangeDateTimezoneType;
});
const state = reactive<{
  timezoneType: number | undefined;
  csvFile: File | null;
}>({
  timezoneType: 1,
  csvFile: null,
});
const timezoneOptions = ref([
  {
    value: 1,
    label: "Local",
  },
  {
    value: 2,
    label: "UTC / GMT",
  },
]);
const csvImportLoader: Ref<boolean> = ref(false);
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);
const uploadedFile: Ref<boolean | null> = ref(null);





const formSchema = computed(() => {
  return z.object({
    csvFile: z.any(),
    timezoneType: isTimezoneChangeAllowed.value ? z.number() : z.any(),
  });
});

const onImportCsv = async () => {
  try {
    const { openingBalanceImportTypeId } =
      props.csvImportConfig;
    if (!openingBalanceImportTypeId || !state.csvFile || !props.financialYearId)
      return;

    csvImportLoader.value = true;
    const payload: FormData = new FormData();
    payload.append("CsvFile", state.csvFile, state.csvFile.name);
    payload.append("TimeZoneType", (state.timezoneType as number).toString());
    payload.append("UserFYearId", props.financialYearId.toString());
    payload.append("OpeningBalanceImportTypeId", openingBalanceImportTypeId.toString());

    const {data, error} = await $api.openingBalance.openingBalancesImportFiles({}, payload);
    if(data.value){
      uploadedFile.value = true;
      emit("save-success", "success");
    }
    else if (error.value) {
      errorNotifier.value?.show(error.value as ErrorObject);
    }
  } catch (e) {
    console.error(e);
  } finally {
    csvImportLoader.value = false;
  }
};

const handleFile = (files: File[]) => {
  if (files.length > 0) {
    state.csvFile = files[0];
  }
};

</script>
<template>
  <div class="rounded-lg mb-8">
    <div
      class="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
    >
      <div class="mb-4 -mt-4 relative">
        <div
          class="bg-gray-50 dark:bg-gray-800 rounded-md px-2 text-gray-700 dark:text-gray-400 text-lg font-medium absolute -top-4 -left-2"
        >
          <span> {{ csvImportConfig.importName }}</span>
        </div>
      </div>
      <p
        v-html="csvImportConfig.importHtmlDescription"
        class="mt-6 text-sm text-gray-600 dark:text-gray-200 [&>p]:mt-1 [&_a]:text-blue-700"
      />
      <ErrorNotifier ref="errorNotifier" />
      <UForm
        key="csv-form-open-bal"
        :schema="formSchema"
        :state="state"
        class="space-y-4 mt-4"
        @submit="onImportCsv"
      >
        <div class="grid grid-cols-1 content-between">
          <div>
            <div class="grid grid-cols-1 items-center">
              <label
                for="file"
                class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
                >CSV File:
              </label>
              <FileUpload @on-file="handleFile" />
            </div>

            <div
              v-if="isTimezoneChangeAllowed"
              class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 items-center mt-4"
            >
              <label
                for="timezone"
                class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1 col-span-2"
                >From Request (Timezone):
              </label>

              <div class="col-span-3 flex">
                <URadio
                  v-model="state.timezoneType"
                  v-for="timezoneType in timezoneOptions"
                  :value="timezoneType.value"
                  :key="timezoneType.value" 
                  class="me-4"
                >
                  <template #label>
                    <span class="italic">{{ timezoneType.label }}</span>
                  </template>
                </URadio>
              </div>
            </div>
          </div>
          <div
            class="flex items-center w-full"
            :class="{
              'justify-between': uploadedFile,
              'justify-end': !uploadedFile,
            }"
          >
            <p v-if="uploadedFile" class="text-green-600">
              Successfully queued the transaction file.
            </p>
            <button
			  @click="onImportCsv"
              type="submit"
              class="bg-base-400 border border-base-400 md:border-0 py-3 px-6 focus:outline-none hover:bg-base-500 rounded text-white md:mt-2 text-sm mt-2 grow-0 max-w-24"
            >
              <span>Import</span>
            </button>
          </div>
        </div>
      </UForm>
      <loader :loading="csvImportLoader" />
    </div>
  </div>
</template>
