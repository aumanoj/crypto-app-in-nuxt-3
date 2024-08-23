<script lang="ts" setup>
type Tab = {
  label: string;
  name: string;
};

const props = defineProps<{
  tabs: Tab[];
  contentHeight?: string;
}>();

const activeTab = ref(props.tabs[0]?.name);
const defaultHeight = 'h-[28rem]';

const contentHeightClass = computed(() => {
  if (props.contentHeight === 'h-auto') return '';
  return props.contentHeight || defaultHeight;
});

const setActiveTab = (tabName: string) => {
  activeTab.value = tabName;
};

watch(
  () => props.tabs,
  () => {
    setActiveTab(props.tabs[0].name);
  },
);
</script>

<template>
  <div>
    <ul
      class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700"
    >
      <li v-for="tab in tabs" :key="tab.name" class="me-1">
        <a
          href="#"
          @click.prevent="setActiveTab(tab.name)"
          class="inline-flex items-center px-4 py-3 rounded w-full rounded-b-none border-b-0"
          :class="{
            'bg-gray-100 dark:bg-gray-800 font-normal text-black bg-primary-300': activeTab === tab.name,
            'bg-gray-100 dark:bg-gray-800 font-normal': activeTab !== tab.name,
          }"
        >
          <span>{{ tab.label }}</span>
        </a>
      </li>
    </ul>

    <div :class="['mt-6', 'w-full', 'overflow-y-auto', contentHeightClass]">
      <transition name="fade" mode="out-in">
        <slot :name="activeTab" :key="activeTab" />
      </transition>
    </div>
  </div>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>