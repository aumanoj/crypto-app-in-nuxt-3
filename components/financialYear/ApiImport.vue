<script lang="ts" setup>
import type ErrorNotifier from "@/components/global/ErrorNotifier.vue";
import type { ApiImport } from "@/types/exchanges";
import { z } from "zod";
import type { ErrorObject } from "~/types/api-instance";
import type {EmittedTransactionImportData} from "~/types/exchanges";

const { $api } = useNuxtApp();

const props = defineProps<{
  apiImportConfig: ApiImport;
}>();
const emit = defineEmits(["save-success"]);

const state = reactive<{
  apiKey: string | undefined;
  apiSecret: string | undefined;
  apiPassPhrase: string | undefined;
}>({
  apiKey: undefined,
  apiSecret: undefined,
  apiPassPhrase: undefined,
});
const apiImportLoader = ref(false);
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);
const apiImportForm = ref(null);

const formSchema = computed(() => {
  const apiSettings = props.apiImportConfig.apiSettings;
  return z.object({
    ...(apiSettings.hasApiKey && {
      apiKey: z.string().nullish().refine((val) => val !== null && val !== undefined && val.length > 0, {
        message: `${apiSettings.apiKeyDisplayName} is required`,
      }),
    }),
    ...(apiSettings.hasApiKeySecret && {
      apiSecret: z.string().nullish().refine((val) => val !== null && val !== undefined && val.length > 0, {
        message: `${apiSettings.apiSecretDisplayName} is required`,
      }),
    }),
    ...(apiSettings.hasApiKeyPassphrase && {
      apiPassPhrase: z.string().nullish().refine((val) => val !== null && val !== undefined && val.length > 0, {
        message: `${apiSettings.apiPassPhraseDisplayName} is required`,
      }),
    }),
  });
});

const onSubmitApiForm = async () => {
  if (apiImportForm.value) {
    try {
      await (apiImportForm.value as any).validate();
    } catch (error) {
    }
  
    const e = (apiImportForm.value as any).getErrors();
    if (Array.isArray(e) && e.length === 0) {
      onImportWallet();
    }
  }
};

const onImportWallet = async () => {
  try {
    const { userFYearId, exchangeId, exchangeImportTypeId } =
      props.apiImportConfig;

    if (!userFYearId || !exchangeId || !exchangeImportTypeId) return;
    apiImportLoader.value = true;
    const { data, error } =
      await $api.txHistoryImportExchange.txImportExchangeApi(
        {
          server: false,
        },
        {
          exchangeId,
          exchangeImportTypeId,
          userFYearId,
          apiKey: state.apiKey,
          apiSecret: state.apiSecret,
          apiPassPhrase: state.apiPassPhrase,
        },
      );

    if (error.value) {
      errorNotifier.value?.show(error.value as ErrorObject);
    }

    if (data.value) {
      const emittedData: EmittedTransactionImportData = {
        imports: data.value
      };
      emit("save-success", emittedData);
    }
  } catch (error) {
    console.log(error);
  } finally {
    apiImportLoader.value = false;
  }
};

watch(
  () => props.apiImportConfig,
  () => {
    const {
      hasApiKey,
      maskedApiKey,
      hasApiKeySecret,
      maskedApiSecret,
      hasApiKeyPassphrase,
      maskedApiPassPhrase,
    } = props.apiImportConfig.apiSettings;

    if (hasApiKey) {
      state.apiKey = maskedApiKey as string;
    }

    if (hasApiKeySecret) {
      state.apiSecret = maskedApiSecret as string;
    }

    if (hasApiKeyPassphrase) {
      state.apiPassPhrase = maskedApiPassPhrase as string;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="rounded-lg mb-8">
    <div class="p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <div class="mb-4 -mt-4 relative">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-md px-2 text-gray-700 dark:text-gray-400 text-lg font-medium absolute -top-4 -left-2">
          <span>{{ apiImportConfig.importName }}</span>
        </div>
      </div>

      <!-- Move ErrorNotifier here, at the top of the grayed section -->
      <ErrorNotifier ref="errorNotifier" class="mb-5"/>

      <div class="flex flex-col md:flex-row md:space-x-4">
        <!-- Left column: Description (60% width on medium screens and up) -->
        <div class="md:w-[50%] mb-4 md:mb-0">
          <div
            v-html="apiImportConfig.importHtmlDescription"
            class="raw-html-content mt-0 text-sm text-gray-600 dark:text-gray-200 [&>p]:mt-1 [&_a]:text-blue-700 overflow-y-auto max-h-[60vh]"
          />
        </div>

        <!-- Vertical Separator -->
        <div class="hidden md:block w-px bg-gray-300 dark:bg-gray-700"></div>

        <!-- Right column: Import functionality (40% width on medium screens and up) -->
        <div class="md:w-[50%] md:pl-0 flex flex-col h-full">          
          <div role="alert" class="p-3 mb-3 text-sm rounded-lg bg-yellow-50 border-l-4 border-yellow-400 flex items-center">
            <div>
              <strong class="font-semibold">Important: </strong> 
              <span>Do not share your API Key or Secret Key with anyone.
                Keep these credentials secure at all times.</span>
            </div>
          </div>
          <UForm
            :schema="formSchema"
            :state="state"
            class="flex flex-col h-full"
            ref="apiImportForm"
          >
            <div class="flex-grow flex flex-col">
              <div v-if="apiImportConfig.apiSettings.hasApiKey" class="mb-3">
                <label
                  for="apiKey"
                  class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
                >{{ apiImportConfig.apiSettings.apiKeyDisplayName }}:</label>
                <UInput
                  v-model="state.apiKey"
                  id="apiKey"
                  type="text"
                  size="xl"
                  class="w-full"
                  :placeholder="`Enter ${apiImportConfig.apiSettings.apiKeyDisplayName}`"
                />
              </div>

              <div v-if="apiImportConfig.apiSettings.hasApiKeySecret" class="mb-3">
                <label
                  for="apiSecret"
                  class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
                >{{ apiImportConfig.apiSettings.apiSecretDisplayName }}:</label>
                <UInput
                  v-model="state.apiSecret"
                  id="apiSecret"
                  type="text"
                  size="xl"
                  class="w-full text-xs"
                  :placeholder="`Enter ${apiImportConfig.apiSettings.apiSecretDisplayName}`"
                />
              </div>

              <div v-if="apiImportConfig.apiSettings.hasApiKeyPassphrase" class="mb-3">
                <label
                  for="apiPassPhrase"
                  class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
                >{{ apiImportConfig.apiSettings.apiPassPhraseDisplayName }}:</label>
                <UInput
                  v-model="state.apiPassPhrase"
                  id="apiPassPhrase"
                  type="text"
                  size="xl"
                  class="w-full"
                  :placeholder="`Enter ${apiImportConfig.apiSettings.apiPassPhraseDisplayName}`"
                />
              </div>
            </div>

            <div class="mt-auto flex justify-end">
              <UButton
                @click="onSubmitApiForm"
                class="bg-base-400 border border-base-400 md:border-0 py-3 px-10 focus:outline-none hover:bg-base-500 rounded-md text-white text-base font-semibold"
              >
                <span>Import</span>
              </UButton>
            </div>
          </UForm>
          <loader :loading="apiImportLoader" />
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