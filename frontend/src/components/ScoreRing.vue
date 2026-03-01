<script setup lang="ts">
const props = defineProps<{ score: number }>();
const radius = 52;
const circumference = 2 * Math.PI * radius;
const progress = Math.max(0, Math.min(100, props.score));
const dash = `${(progress / 100) * circumference} ${circumference}`;
</script>

<template>
  <div class="relative h-32 w-32">
    <svg class="h-32 w-32 -rotate-90" viewBox="0 0 140 140">
      <circle cx="70" cy="70" :r="radius" fill="none" stroke="#dbeafe" stroke-width="12" />
      <circle cx="70" cy="70" :r="radius" fill="none" stroke="#00d4aa" stroke-width="12" :stroke-dasharray="dash" stroke-linecap="round" />
    </svg>
    <div class="absolute inset-0 grid place-items-center text-center">
      <div>
        <p class="text-3xl font-bold text-brand">{{ score }}</p>
        <p class="text-xs text-slate-500">/100</p>
      </div>
    </div>
  </div>
</template>
