<template>
  <!-- $route.name == addTableRouterName ||
      $route.name == addViewTableRouterName ||
      $route.name == addBlockApiRouterName ||
      $route.name == addTableTaskRouterName ||
      $route.name == addExcelExportTemplateRouterName || -->
  <template v-if="$route.name == dashboardAdd">
    <router-view :key="$route.fullPath" />
  </template>
  <template v-else>
    <router-view v-slot="{ Component }">
      <transition>
        <keep-alive :exclude="`tableAdd`">
          <component :is="Component" :key="$route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </template>
</template>
<script setup lang="ts">
import {
  addTableRouterName,
  addViewTableRouterName,
  addBlockApiRouterName,
  addTableTaskRouterName,
  addExcelExportTemplateRouterName,
  dashboardAdd,
} from '@/router/index';
import { pageSignPiniaStore } from '@/store/pageSignPiniaStore';

const pageStore = pageSignPiniaStore();
</script>
