<script setup lang="ts">
// #TODO: steps clickable
const props = defineProps<{
  currentStep: number;
}>();

const emit = defineEmits(['current-step-change']);

type StepClassText = {
  containerClasses: string;
  textClass: string;
  isCompleted: boolean;
};

const steps = ref<string[]>([
  "Opening Balances",
  "Import Transactions",
  "Ignore Spam Coins",
  "Review Transfer Records",
  "Calculate Tax",
  "Tax Reports",
]);

const helpTexts = ref<string[][]>([
  ["Set your opening balances", "This is the starting point for your financial year"],
  ["Import your transactions", "You can import from various sources or manually enter them"],
  ["Identify and ignore spam coins", "This helps clean up your transaction list"],
  ["Review your transactions", "Make sure everything is correct before calculating tax"],
  ["Calculate your tax", "Based on your jurisdiction and transaction history"],
  ["Generate tax reports", "Get detailed reports for your tax filing"],
]);

const currentHelpText = ref<string[]>([]);

// Use computed with TypeScript for type safety
const stepClassAndText = computed<StepClassText[]>(() =>
  steps.value.map((_, index): StepClassText => {
    const baseClasses =
      "flex items-center justify-center border-2 rounded-full w-8 h-8 p-1 me-2 shrink-0";
    const isCompleted = index < props.currentStep - 1;
    const isCurrent = props.currentStep - 1 === index;

    return {
      containerClasses: `${baseClasses} ${isCompleted ? "border-base-500 bg-base-500" : isCurrent ? "border-base-500" : "border-gray-300"}`,
      textClass: isCurrent ? "text-base-500" : "text-gray-500",
      isCompleted,
    };
  })
);

// Add a new computed property for the maximum step name length
const maxStepNameLength = computed(() => 
  Math.max(...steps.value.map(step => step.length))
);

function handleStepClick(index: number) {
  currentHelpText.value = helpTexts.value[index];
  emit('current-step-change', index + 1);
}
</script>

<template>
  <div class="w-full flex flex-col border border-gray-300 rounded">
    <template v-for="(item, index) in steps" :key="index">
      <div
        class="flex flex-col p-4 basis-full border-b border-b-gray-300 cursor-pointer"
        :class="{
          'border-b-0': index === steps.length - 1,
        }"
        @click="handleStepClick(index)"
      >
        <div class="flex items-center">
          <div :class="stepClassAndText[index].containerClasses">
            <span
              v-if="!stepClassAndText[index].isCompleted"
              :class="stepClassAndText[index].textClass"
              class="text-sm"
            >
              {{ index + 1 }}
            </span>
            <template v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                class="text-white"
              >
                <path
                  fill-rule="evenodd"
                  d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </template>
          </div>
          <span 
            :class="`text-sm ${stepClassAndText[index].textClass} flex-grow font-semibold`"
          >
            {{ item }}
          </span>
          <!-- Info icons -->
          <UPopover mode="hover" :popper="{ arrow: true, placement: 'right' }">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              class="text-gray-500 ml-3 shrink-0"
            >
              <path
                fill="currentColor"
                d="M12 17q.425 0 .713-.288T13 16v-4q0-.425-.288-.712T12 11t-.712.288T11 12v4q0 .425.288.713T12 17m0-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"
              />
            </svg>

            <template #panel>
              <div class="w-64 max-w-sm bg-base-400 dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden p-4">
                <div class="text-xs text-white space-y-2">
                  <p>{{ helpTexts[index][0] }}</p>
                  <p>{{ helpTexts[index][1] }}</p>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
        <div v-if="currentHelpText[0] === helpTexts[index][0]" class="mt-2 ml-10 text-sm text-gray-600">
          <p>{{ helpTexts[index][0] }}</p>
          <p>{{ helpTexts[index][1] }}</p>
        </div>
      </div>
      <svg
        v-if="index < steps.length - 1"
        class="w-5 h-auto shrink-0 text-gray-300 hidden"
        viewBox="0 0 22 80"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 -2L20 40L0 82"
          vector-effect="non-scaling-stroke"
          stroke="currentcolor"
          stroke-linejoin="round"
        ></path>
      </svg>
    </template>
  </div>
</template>