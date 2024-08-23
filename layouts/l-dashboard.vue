<script lang="ts" setup></script>
<template>
  <div class="container mx-auto h-lvh">
    <app-header :is-dashboard="true" />
    <slot />
    <app-footer :is-dashboard="true" />
  </div>
</template>
