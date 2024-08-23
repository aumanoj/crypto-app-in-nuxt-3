<script lang="ts" setup>
const props = defineProps<{
  isDashboard?: boolean;
}>();

const isMenuOpen = ref(false);
const publicLinks = ref([
  { name: "Features", href: "#", icon: "/assets/icons/fullscreen.svg" },
  { name: "Help", href: "#", icon: "/assets/icons/fullscreen.svg" },
  { name: "Blog", href: "#", icon: "/assets/icons/fullscreen.svg" },
  { name: "Pricing", href: "#", icon: "/assets/icons/fullscreen.svg" },
]);

const dashboardLinks = ref([
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "/assets/icons/fullscreen.svg",
  },
  { name: "Support", href: "/", icon: "/assets/icons/fullscreen.svg" },
]);

const links = computed(() => {
  return props.isDashboard ? dashboardLinks.value : publicLinks.value;
});

const login = async () => {
  if (props.isDashboard) {
    await useMSAuth().signOut();
  } else {
    await useMSAuth().signIn();
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>
<template>
  <header class="text-gray-600 dark:text-white text-opacity-90 body-font">
    <div
      class="container mx-auto flex flex-wrap p-5 flex-row items-center justify-between"
    >
      <a
        class="flex title-font font-medium items-center text-gray-900 dark:text-white text-opacity-90"
      >
        <div class="w-[100%] max-w-[120px] min-w-[50px]">
          <img
            src="../../public/logo.png"
            alt="Crypto Tax Labs Logo"
            class="w-full h-auto object-contain"
          />
        </div>
      </a>
      <div class="flex items-center">
        <nav
          class="hidden md:ml-auto md:mr-auto md:flex flex-wrap items-center text-base justify-center"
        >
          <nuxt-link
            v-for="link in links"
            :key="link.href"
            :to="link.href"
            class="mr-7 group-link hover:text-base-400 cursor-pointer flex items-center"
          >
            <img :src="link.icon" class="w-6 h-6 text-base-400 me-2" />
            <span class="text-lg">{{ link.name }}</span>
          </nuxt-link>
        </nav>

        <button
          @click="login"
          class="inline-flex items-center md:bg-base-400 border border-base-400 md:border-0 p-2 focus:outline-none hover:bg-base-500 rounded text-white md:mt-0"
          :class="{
            'md:p-2': isDashboard,
            'md:p-3': !isDashboard,
          }"
        >
          <span class="hidden md:inline" v-if="!isDashboard">
            Login / Sign up
          </span>
          <span class="hidden md:inline" v-else>
            <svg
              width="26px"
              height="26px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H15"
                stroke="#ffffff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
              />
              <path
                d="M19 12L15 8M19 12L15 16M19 12H9"
                stroke="#ffffff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
              />
            </svg>
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="26"
            viewBox="0 -960 960 960"
            width="26"
            fill="currentColor"
            class="text-base-400 md:hidden"
          >
            <path
              d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"
            />
          </svg>
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-4 h-4 ml-1 hidden md:hidden"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </button>
        <button
          @click="toggleMenu"
          class="z-50 inline-flex items-center border-base-400 border p-3 focus:outline-none rounded text-base-400 md:hidden ms-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18"
            viewBox="0 -960 960 960"
            width="18"
            fill="currentColor"
            class="text-base-400"
          >
            <path
              d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"
            />
          </svg>
          <div v-if="isMenuOpen">
            <!-- backdrop -->
            <div
              @click.stop="toggleMenu"
              class="absolute left-0 top-0 w-lvw h-lvh bg-black opacity-5 z-40"
            />
            <div
              class="z-50 absolute top-[70px] sm:right-12 right-5 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
            >
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li v-for="link in links" :key="link.href">
                  <nuxt-link
                    @click.stop="toggleMenu"
                    :to="link.href"
                    class="block px-4 py-2 hover:bg-base-50 dark:hover:bg-gray-600 dark:hover:text-white"
                    >{{ link.name }}
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </div>
        </button>
        <button
          @click="isDark = !isDark"
          class="ms-2 border p-2 rounded border-base-400"
        >
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            fill="currentColor"
            class="text-white"
          >
            <path
              d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"
            />
          </svg>

          <svg
            v-if="!isDark"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <path
              d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>