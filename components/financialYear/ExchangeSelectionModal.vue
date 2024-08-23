<script lang="ts" setup>
import type TxImportModal from "@/components/financialYear/TxImportModal.vue";
import type { TransactionImport } from "@/types/exchanges";
import type {EmittedTransactionImportData} from "@/types/exchanges";

const emit = defineEmits(["save-success"]);

const isOpen = ref(false);
const txImportModal: Ref<InstanceType<typeof TxImportModal> | null> = ref(null);
const isTxImportModalOpen = ref(false);
const userFinancialYearId: Ref<number | null> = ref(null);

const openExchangeSelectionModal = (userFYId: number | null) => {
  isOpen.value = true;
  userFinancialYearId.value = userFYId;
};

const onExchangeSelection = (exchangeId: number) => {
  if (!txImportModal.value) return "";

  isTxImportModalOpen.value = true;
  txImportModal.value.openTxImportModal(exchangeId, userFinancialYearId.value);
};

const onSaveSuccess = (data: EmittedTransactionImportData) => {
  emit("save-success", data);
  if (data.close !== false) {
    isTxImportModalOpen.value = false;
    isOpen.value = false;
  }
};

const onTxModalClose = () => {
  isTxImportModalOpen.value = false;
};

defineExpose({
  openExchangeSelectionModal,
});
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      :ui="{
        width: 'w-full sm:max-w-7xl',
      }"
      :prevent-close="isTxImportModalOpen"
    >
      <UCard
        :ui="{
          ring: '',
        }"
      >
        <exchange-list
          :is-modal="true"
          @on-exchange-selection="onExchangeSelection"
        />
        <template #footer>
          <div class="w-full grid justify-items-end content-center">
            <button
              @click="isOpen = false"
              class="border border-base-400 py-1 px-4 focus:outline-none rounded text-primary text-sm grow-0 max-w-24"
            >
              <span>Close</span>
            </button>
          </div>
        </template>
      </UCard>
    </UModal>
    <financial-year-tx-import-modal
      v-if="isOpen"
      ref="txImportModal"
      @save-success="onSaveSuccess"
      @tx-modal-close="onTxModalClose"
    />
  </div>
</template>
