<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import type ErrorNotifier from "@/components/global/ErrorNotifier.vue";
import type { WalletAddressImport } from "@/types/exchanges";
import { z } from "zod";
import type { ErrorObject } from "~/types/api-instance";
import type {EmittedTransactionImportData} from "~/types/exchanges";

const { $api } = useNuxtApp();

const props = defineProps<{
  walletAddressImportConfig: WalletAddressImport;
}>();
const emit = defineEmits(["save-success"]);

const state = reactive<{
  walletAddresses: string;
}>({
  walletAddresses: '',
});
const walletAddressImportLoader = ref(false);
const errorNotifier: Ref<InstanceType<typeof ErrorNotifier> | null> = ref(null);
const walletAddressImportForm = ref(null);

const schema = computed(() => {
  const min = Number(props.walletAddressImportConfig.addressSettings.minLength);
  const max = Number(props.walletAddressImportConfig.addressSettings.maxLength * 20); // max 20 addresses approx

  return z.object({
    walletAddresses: z
      .string()
      .min(min, `Wallet address should be at least ${min} charachters`)
      .max(max, `Wallet address should be maximum ${max} charachters`),
  });
});

type Schema = z.output<typeof schema.value>;

const submitWallet = async () => {
  if (walletAddressImportForm.value) {
    try {
    await (walletAddressImportForm.value as any).validate();
    } catch (error) {
     }
    const e = (walletAddressImportForm.value as any).getErrors();

    if (Array.isArray(e) && e.length === 0) {
      await onImportWallet();
    }
  }
};

const onImportWallet = async () => {
  try {
    const { userFYearId, exchangeId, exchangeImportTypeId } =
      props.walletAddressImportConfig;

    if (!userFYearId || !exchangeId || !exchangeImportTypeId) return;
    walletAddressImportLoader.value = true;
    const { data, error } =
      await $api.txHistoryImportExchange.txImportExchangeWalletAddress(
        {
          server: false,
        },
        {
          exchangeId,
          exchangeImportTypeId,
          userFYearId,
          WalletAddress: state.walletAddresses,
        },
      );

    if (data.value) {
      const emittedData: EmittedTransactionImportData = {
        imports: data.value
      };
      emit("save-success", emittedData);
    }

    if (error.value) {
      errorNotifier.value?.show(error.value as ErrorObject);
    }
  } catch (error) {
    //console.log(error);
  } finally {
    walletAddressImportLoader.value = false;
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
          <span>{{ walletAddressImportConfig.importName }}</span>
        </div>
      </div>
      <p
        v-html="walletAddressImportConfig.importHtmlDescription"
        class="mt-2 text-sm text-gray-600 [&>p]:mt-1 [&_a]:text-blue-700"
      />
      <ErrorNotifier ref="errorNotifier" />
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 mt-8"
        ref="walletAddressImportForm"
      >
        <div class="grid grid-cols-1 content-between">
          <UFormGroup
              name="walletAddresses"
              :ui="{
                    wrapper: 'flex justify-between items-top field-container',
                   }"
          >
            <template #label>
            <span class="text-base font-medium text-gray-700 dark:text-gray-200 mb-1">
              Wallet Addresses:
            </span>
            </template>
            <UTextarea
                v-model.trim="state.walletAddresses"
                :rows="3"
                name="walletAddresses"
                placeholder="Enter wallet addresses (one per line or comma-separated)"
                :ui="{
              wrapper: 'w-full',
            }"
            />
          </UFormGroup>
          <div class="flex justify-end w-full">
            <UButton
              @click="submitWallet"
              class="bg-base-400 border border-base-400 md:border-0 py-3 px-6 focus:outline-none hover:bg-base-500 rounded text-white md:mt-2 text-sm mt-2 grow-0 max-w-24"
            >
              <span>Import</span>
            </UButton>
          </div>
        </div>
      </UForm>
      <loader :loading="walletAddressImportLoader" />
    </div>
  </div>
</template>
<style>
.field-container > div:nth-child(2) {
  width: 80%;
}
</style>
