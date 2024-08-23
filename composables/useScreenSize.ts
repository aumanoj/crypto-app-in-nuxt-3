import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useScreenSize() {
  const height = ref(window.innerHeight)

  function onResize() {
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  const defaultPageSize = computed(() => {
    if (height.value > 2000) return 30; // More than 2K (assuming 2160px in height)
    if (height.value > 1400) return 25; // 2K screens (assuming 1440p is the baseline for 2K)
    return 20; // Default for smaller screens
  });

  return { height, defaultPageSize }
}