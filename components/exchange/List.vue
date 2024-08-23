<script lang="ts" setup>
import type { IExchange } from "@/types/exchanges";
import type { Ref } from "vue";

const { $api } = useNuxtApp();

defineProps<{
  isDashboard?: boolean;
  isModal?: boolean;
}>();

const emits = defineEmits(["on-exchange-selection"]);

const isLoading = ref(true);
const searchTerm = ref("");
const exchangesList: Ref<IExchange[]> = ref([]);

const getFilteredList = computed(() => {
  if (!searchTerm.value) return [...exchangesList.value];

  return exchangesList.value.filter((exchange: any) => {
    return exchange.name.toLowerCase().includes(searchTerm.value.toLowerCase());
  });
});

const getExchangesList = async () => {
  try {
    const { data } = await $api.exchange.getExchanges();
    if (data.value) {
      exchangesList.value = data.value;
    }
  } catch (e) {
    // #TODO: Handle errors properly with toast error message
    console.log(e);
  } finally {
    isLoading.value = false;
  }
};

const onExchangeSelection = (exchange: IExchange) => {
  emits("on-exchange-selection", exchange.id);
};

onMounted(() => {
  getExchangesList();
});
</script>
<template>
  <section
    :class="{
      'mt-0 mb-10 md:mt-10 md:mb-20 pt-10': !isModal,
      'my-5': isModal,
    }"
  >
    <div class="flex flex-col text-center w-full mb-0 lg:mb-10">
      <!-- Search with button  -->
      <div class="container mx-auto flex justify-center px-5 md:px-10 lg:p-0">
        <div
          class="flex justify-between w-full rounded-lg p-4 mr-0 border text-gray-800 dark:bg-gray-700 dark:text-white text-opacity-90 dark:border-gray-600 border-gray-200 text-sm"
        >
        <input
          v-model="searchTerm"
          type="text"
          id="exchange-search"
          name="exchangeSearch"
          placeholder="Search by exchange name..."
          class="w-full bg-transparent focus:outline-none dark:bg-gray-700 font-serif"
        />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            fill="currentColor"
            class="dark:text-white text-opacity-90"
          >
            <path
              d="M779.385-153.846 528.923-404.307q-30 25.538-69 39.538-39 14-78.385 14-96.1 0-162.665-66.529-66.566-66.529-66.566-162.577t66.529-162.702q66.529-66.654 162.577-66.654 96.049 0 162.702 66.565Q610.769-676.101 610.769-580q0 41.692-14.769 80.692-14.769 39-38.769 66.693l250.462 250.461-28.308 28.308ZM381.538-390.769q79.616 0 134.423-54.808Q570.769-500.385 570.769-580q0-79.615-54.808-134.423-54.807-54.808-134.423-54.808-79.615 0-134.423 54.808Q192.308-659.615 192.308-580q0 79.615 54.807 134.423 54.808 54.808 134.423 54.808Z"
            />
          </svg>
        </div>
      </div>
    </div>
    <div
      v-if="!isLoading && getFilteredList.length === 0"
      class="container mx-auto text-center w-full text-blue-600 mt-4 lg:mt-0 max-w-xl"
    >
      <UAlert
        icon="i-heroicons-command-line"
        color="blue"
        variant="outline"
        title="No exchanges found. Please use the 'Custom Csv' import option to import
      the data."
      />
    </div>
    <div
      class="container mx-auto grid text-center h-96 overflow-y-scroll p-5 md:p-10 lg:p-0 auto-rows-min"
      :class="{
        'h-auto xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 grid-cols-1 gap-4':
          isDashboard,
        'h-96 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 grid-cols-1 gap-4':
          !isDashboard && !isModal,
        'h-3xl xl:grid-cols-5 lg:grid-cols-5 md:grid-cols-2 sm:grid-cols-1 grid-cols-1 gap-4 overflow-y-auto':
          isModal,
      }"
    >
      <exchange-loader v-if="isLoading" v-for="i in 12" :key="i" />
      <div
        v-for="exchange in getFilteredList"
        class="border dark:border-gray-600 rounded-md grid content-center items-center px-2 py-4"
        :class="{ 'cursor-pointer': isModal }"
        :key="exchange.id"
        @click="onExchangeSelection(exchange)"
      >
        <!-- service block -->
        <div class="flex items-center ps-2">
          <div class="text-gray-900 flex items-center">
            <img
              v-if="exchange.logoUrl"
              :src="exchange.logoUrl"
              :alt="exchange.name"
              class="w-12 h-12 object-fit self-center"
            />
          </div>
          <!-- Change text-md to  -->
          <h3
            class="text-md leading-normal font-semibold text-black dark:text-white text-opacity-90 col-span-4 text-left ms-2"
          >
            {{ exchange.name }}
          </h3>
        </div>
        <!-- service block -->
      </div>
    </div>
  </section>
</template>
