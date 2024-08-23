<script lang="ts" setup>
import type ErrorNotifier from "@/components/global/ErrorNotifier.vue";
import type { CsvImport } from "@/types/exchanges";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import type { ErrorObject } from "~/types/api-instance";
import type {EmittedTransactionImportData} from "~/types/exchanges";

const { $api } = useNuxtApp();

const props = defineProps<{
  csvImportConfig: CsvImport;
  isMultiple: boolean;
}>();
const emit = defineEmits(["save-success"]);

const isTimezoneChangeAllowed = computed(() => {
  return props.csvImportConfig.csvSettings.allowChangeDateTimezoneType;
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
    key: uuidv4(),
    label: "Local",
  },
  {
    value: 2,
    key: uuidv4(),
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
    // Validate form
    const result = formSchema.value.safeParse(state);
    if (!result.success) {
      // Handle validation errors
      //console.error(result.error);
      return;
    }

    const { userFYearId, exchangeId, exchangeImportTypeId } =
      props.csvImportConfig;
    if (!userFYearId || !exchangeId || !exchangeImportTypeId || !state.csvFile)
      return;

    csvImportLoader.value = true;
    const payload: FormData = new FormData();
    payload.append("csvFile", state.csvFile, state.csvFile.name);
    payload.append("TimeZoneType", (state.timezoneType as number).toString());
    payload.append("UserFYearId", userFYearId.toString());
    payload.append("ExchangeId", exchangeId.toString());
    payload.append("ExchangeImportTypeId", exchangeImportTypeId.toString());

    const { data, error } =
      await $api.txHistoryImportExchange.txImportExchangeCsv({}, payload);

    if (data.value) {
      uploadedFile.value = true;
      const emittedData: EmittedTransactionImportData = {
        imports: data.value,
        close: props.isMultiple ? false : undefined
      };
      emit("save-success", emittedData);
    }

    if (error.value) {
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

const handleClickInsideRawHtml = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.getAttribute('href')) {
    event.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }
};

</script>
<template>
  <div class="rounded-lg mb-8 z-50">
    <div class="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <div class="mb-4 -mt-4 relative">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-md px-2 text-gray-700 dark:text-gray-400 text-lg font-medium absolute -top-4 -left-2">
          <span>{{ csvImportConfig.importName }}</span>
        </div>
      </div>

      <!-- Move ErrorNotifier here, at the top of the grayed section -->
      <ErrorNotifier ref="errorNotifier" class="mb-5"/>

      <div class="flex flex-col md:flex-row md:space-x-4">
        <!-- Left column: Description (60% width on medium screens and up) -->
        <div class="md:w-[60%] mb-4 md:mb-0">
          <div
              v-html="csvImportConfig.importHtmlDescription"
              class="raw-html-content mt-0 text-sm text-gray-600 dark:text-gray-200 [&>p]:mt-1 [&_a]:text-blue-700 overflow-y-auto max-h-[60vh]"
              @click="handleClickInsideRawHtml"
          />
        </div>

        <!-- Vertical Separator -->
        <div class="hidden md:block w-px bg-gray-300 dark:bg-gray-700"></div>

        <!-- Right column: Import functionality (40% width on medium screens and up) -->
        <div class="md:w-[40%] md:pl-0 flex flex-col h-full">
          <div role="alert" class="p-3 mb-2 text-sm rounded-lg bg-yellow-50 border-l-4 border-yellow-400 flex items-center">
          <div>
            <strong class="font-semibold">Important: </strong> 
            <span>Upload the original CSV file without modifications. Editing the file may corrupt its format and affect calculations.</span>
          </div>
        </div>
          <UForm
              key="csv-form"
              :schema="formSchema"
              :state="state"
              class="flex flex-col h-full"
              @submit="onImportCsv"
          >
            <div class="flex flex-col h-full">
              <div class="flex-grow flex flex-col">
                <label
                    for="file"
                    class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
                >CSV File:</label>
                <FileUpload @on-file="handleFile" class="h-[60%] min-h-[200px] mb-4" />

                <div
                    v-if="isTimezoneChangeAllowed"
                    class="mt-2"
                >
                  <label
                      for="timezone"
                      class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >From Request (Timezone):</label>

                  <div class="flex flex-wrap">
                    <URadio
                        v-for="timezoneType in timezoneOptions"
                        v-model="state.timezoneType"
                        :key="timezoneType.key"
                        :value="timezoneType.value"
                        class="me-4 mb-2"
                    >
                      <template #label>
                        <span class="italic">{{ timezoneType.label }}</span>
                      </template>
                    </URadio>
                  </div>
                </div>
              </div>
              <div class="mt-auto flex flex-col">
                <div class="flex justify-end">
                  <button
                      @click="onImportCsv"
                      type="submit"
                      class="bg-base-400 border border-base-400 md:border-0 py-3 px-12 focus:outline-none hover:bg-base-500 rounded text-white text-sm"
                  >
                    <span>Import</span>
                  </button>
                </div>
                <p v-if="uploadedFile" class="text-green-600 mt-2 text-center">
                  Successfully queued the transaction file.
                </p>
              </div>
            </div>
          </UForm>
          <loader :loading="csvImportLoader" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.raw-html-content :deep(*) {
  all: revert;
}
.raw-html-content :deep(.important-note) {
    background-color: #FFF8DC;
    border-left: 5px solid #FFD700;
    padding: 10px;
    margin-top: 20px;
}
</style>
