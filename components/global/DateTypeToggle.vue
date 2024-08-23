<template>
  <div class="date-type-toggle flex items-center">
    <span class="mr-1">{{ label }}</span>
    <div 
      class="toggle-switch" 
      role="switch" 
      :aria-checked="modelValue === 'txDateLocal'" 
      tabindex="0"
      @click.stop="toggle"
      @keydown.space.enter.prevent="toggle"
    >
      <span class="toggle-option">UTC</span>
      <span class="toggle-option">Local</span>
      <span class="toggle-slider"></span>
    </div>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const toggle = () => {
  emit('update:modelValue', props.modelValue === 'txDateUtc' ? 'txDateLocal' : 'txDateUtc');
};
</script>


<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  background: #e0e0e0;
  border-radius: 999px;
  padding: 2px;
  position: relative;
  cursor: pointer;
  font-size: 0.75rem;
}

.toggle-option {
  padding: 2px 8px;
  z-index: 1;
  transition: color 0.3s ease;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background: white;
  border-radius: 999px;
  transition: transform 0.3s ease;
}

.toggle-switch[aria-checked="true"] .toggle-slider {
  transform: translateX(100%);
}

.toggle-switch[aria-checked="true"] .toggle-option:first-child,
.toggle-switch[aria-checked="false"] .toggle-option:last-child {
  color: #888;
}
</style>