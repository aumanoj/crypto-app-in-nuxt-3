<script setup>
import { useMSAuth } from "@/composables/useMSAuth";
definePageMeta({
  title: "Dashboard :: Crypto Tax Labs",
});

const login = async () => {
  await useMSAuth().signIn();
};
</script>

<template>
  <div class="container mx-auto">
    <app-header :is-dashboard="true" />
    <exchange-list :is-dashboard="true" />
    <app-footer />
  </div>
</template>
