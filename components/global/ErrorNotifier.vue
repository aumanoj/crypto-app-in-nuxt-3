<template>
  <UAlert
      v-if="visible"
      color="red"
      variant="outline"
      :title="`${errorData.title}`"
      :close-button="{
      icon: 'i-heroicons-x-mark-20-solid',
      color: 'gray',
      variant: 'link',
      padded: false,
    }"
      @close="handleClose"
      :ui="{
      wrapper: 'mt-4',
    }"
  >
    <template #description>
      <ul class="list-disc pl-5">
        <li v-for="(detail, index) in parsedErrorDetails" :key="index">
          {{ detail }}
        </li>
      </ul>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import type { ErrorObject } from "~/types/api-instance";

const visible = ref(false);
const errorData: Ref<any> = ref({
  statusCode: "",
  statusMessage: "",
  title: "",
  detail: "",
});

const parsedErrorDetails = computed(() => {
  return errorData.value.detail.split('|@|').filter(Boolean);
});

function show(errorObject: ErrorObject) {
  errorData.value.statusCode = errorObject.statusCode;
  errorData.value.statusMessage = errorObject.statusMessage;
  errorData.value.title = errorObject.data?.title || "Error";
  errorData.value.detail = errorObject.data?.detail || errorObject.message;
  visible.value = true;
}

function handleClose() {
  visible.value = false;
}

defineExpose({ show });
</script>
