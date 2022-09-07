<template>
  <!-- <router-view /> -->
  <router-view v-slot="{ Component }">
    <transition>
      <keep-alive>
        <component :is="Component" :key="$route.fullPath" />
      </keep-alive>
    </transition>
  </router-view>
</template>
<script setup lang="ts"></script>
