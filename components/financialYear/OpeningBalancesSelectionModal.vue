<script lang="ts" setup>
import type OBalImportModal from "@/components/financialYear/OpeningBalancesImportModal.vue";
import type { OpeningBalancesImportType } from "@/types/opening-balances"

const emit = defineEmits(["save-success"]);
const props = defineProps<{
  financialYearId: any;
}>();
const isOpen = ref(false);
const openingBalanceImportModal: Ref<InstanceType<typeof OBalImportModal> | null> = ref(null);
const isOpeningBalanceImportModalOpen = ref(false);
const userFinancialYearId: Ref<number | null> = ref(null);

const openingBalanceSelectionModal = (userFYId: number | null) => {
  isOpen.value = true;
  userFinancialYearId.value = userFYId;
};

const openingBalanceListSelection = (opBalanceImportType: OpeningBalancesImportType) => {
  if (!openingBalanceImportModal.value) return "";

  isOpeningBalanceImportModalOpen.value = true; 
  openingBalanceImportModal.value.openBalImportModal(opBalanceImportType, userFinancialYearId.value);
};

const onSaveSuccess = (data: string) => {
  emit("save-success", data);
  if (data === "success") {
    isOpeningBalanceImportModalOpen.value = false;
    isOpen.value = false;
  }
};

const onOpeningBalanceModalClose = () => {
  isOpeningBalanceImportModalOpen.value = false;
};

defineExpose({
  openingBalanceSelectionModal,
});
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      :ui="{
        width: 'w-full sm:max-w-7xl',
      }"
      :prevent-close="isOpeningBalanceImportModalOpen"
    >
      <UCard
        :ui="{
          ring: '',
          header: 'p-0 sm:p-0',
          base: 'overflow-hidden'
        }"
      >
        <opening-balances-import-types-list
          :is-modal="true"
          @open-balance-selection="openingBalanceListSelection"
          :financial-year-id="financialYearId"
        />
        <template #header>
          <div class="bg-gray-100 w-full">
            <div class="p-4">
              <h2 class="text-lg font-medium text-gray-900">Import Opening Balances</h2>
              <p class="text-sm text-gray-600 mt-1">Import coins balance at the start of the financial year.</p>
            </div>
          </div>
        </template>
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
    <financial-year-opening-balances-import-modal
      v-if="isOpen"
      ref="openingBalanceImportModal"
      @save-success="onSaveSuccess"
      @tx-modal-close="onOpeningBalanceModalClose"
    />
  </div>
</template>