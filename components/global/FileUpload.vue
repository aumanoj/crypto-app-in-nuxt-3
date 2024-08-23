<script lang="ts" setup>
import { v4 as uuidv4 } from "uuid";

const emit = defineEmits(["on-file"]);

const filelist: Ref<File[]> = ref([]);
const file: Ref<HTMLInputElement | null> = ref(null);
const fieldName: Ref<string> = ref(uuidv4());

const onChange = () => {
  if (!file.value || !file.value.files) return;
  filelist.value = [...file.value.files];
  emit("on-file", filelist.value);
};

const remove = (i: number) => {
  filelist.value.splice(i, 1);
};

const dragover = (event: any) => {
  event.preventDefault();

  if (!event.currentTarget.classList.contains("bg-base-200")) {
    event.currentTarget.classList.remove("bg-gray-100");
    event.currentTarget.classList.add("bg-base-200");
  }
};
const dragleave = (event: any) => {
  event.currentTarget.classList.add("bg-gray-100");
  event.currentTarget.classList.remove("bg-base-200");
};
const drop = (event: any) => {
  event.preventDefault();
  if (!file.value) return;
  file.value.files = event.dataTransfer.files;
  onChange();
  event.currentTarget.classList.add("bg-gray-100");
  event.currentTarget.classList.remove("bg-base-200");
};
const onLabelClick = () => {
  const fileEl = document.getElementById(fieldName.value);
  fileEl?.click();
};
</script>

<template>
  <div
    class="flex items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <input
      :key="fieldName"
      type="file"
      :name="fieldName"
      :id="fieldName"
      class="w-px h-px opacity-0 overflow-hidden absolute"
      @change="onChange"
      ref="file"
      accept=".csv"
    />

    <label
      :for="fieldName"
      class="flex flex-col items-center justify-center w-full h-28 cursor-pointer"
      @click="onLabelClick()"
    >
      <div class="flex flex-col items-center justify-center">
        <svg
          class="w-8 h-8 text-base-400 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
          />
        </svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <ul v-if="filelist.length" v-cloak>
          <li class="text-sm p-1" v-for="file in filelist">
            {{ file.name }}
            <button
              class="ml-2 text-red-500"
              type="button"
              @click.self.prevent="remove(filelist.indexOf(file))"
              title="Remove file"
            >
              Remove
            </button>
          </li>
        </ul>
      </div>
    </label>
  </div>
</template>
