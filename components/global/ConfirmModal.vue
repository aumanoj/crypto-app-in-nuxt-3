<script lang="ts" setup>
defineProps<{
  title: string;
}>();

const modal = useModal();

const emit = defineEmits(["confirm"]);

const onConfirm = () => {
  emit("confirm");
  onDismiss();
};

const onDismiss = () => {
  modal.close();
};
</script>

<template>
  <UModal>
    <UCard>
      <div class="space-y-2">
        <p class="font-light leading-6" v-html="title" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            @click="onDismiss"
            variant="outline"
            color="black"
            :ui="{
              padding: {
                sm: 'px-5',
              },
            }"
          >
            No
          </UButton>
          <UButton
            @click="onConfirm"
            class="bg-red-400 text-white"
            :ui="{
              padding: {
                sm: 'px-5',
              },
            }"
          >
            Confirm
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
