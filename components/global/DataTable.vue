<script setup lang="ts">
import { computed, ref } from "vue";

interface Header {
  text: string;
  sortable: boolean;
  key: string;
}

interface Item {
  [key: string]: string | number;
}

const props = defineProps<{
  headers: any[];
  items: any[];
}>();

const sorting: Ref<{ key: string; ascending: boolean } | null> = ref(null);

const sortedItems = computed(() => {
  const { headers, items } = props;
  if (!sorting.value) return items;
  const { key, ascending } = sorting.value;
  return [...items].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
});

const toggleSort = (key: string) => {
  if (!sorting.value || sorting.value.key !== key) {
    sorting.value = { key, ascending: true };
  } else {
    sorting.value.ascending = !sorting.value.ascending;
  }
};
</script>

<template>
  <div class="overflow-auto h-64 relative">
    <div class="bg-white sticky top-0 z-10">
      <div class="flex">
        <div
          class="p-2"
          v-for="header in headers"
          :key="header.key"
          @click="header.sortable ? toggleSort(header.key) : null"
        >
          {{ header.text }}
        </div>
      </div>
    </div>
    <div class="bg-gray-100">
      <div v-for="item in sortedItems" :key="item.id" class="flex">
        <div class="p-2" v-for="header in headers" :key="header.key">
          {{ item[header.key] }}
        </div>
      </div>
    </div>
  </div>
</template>
