<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAnalysisStatus } from '../../api';
import { useAnalysisStore } from '../../stores/analysis';

const router = useRouter();
const store = useAnalysisStore();
const timer = ref<number | null>(null);

async function poll() {
  if (!store.taskId) return;
  const status = await getAnalysisStatus(store.taskId);
  store.setStatus(status);
  if (status.status === 'completed') {
    if (timer.value) window.clearInterval(timer.value);
    router.replace(`/report/${store.taskId}`);
  }
}

onMounted(async () => {
  if (!store.taskId) {
    router.replace('/upload');
    return;
  }

  await poll();
  timer.value = window.setInterval(poll, 1000);
});

onUnmounted(() => {
  if (timer.value) window.clearInterval(timer.value);
});
</script>

<template>
  <section class="card mx-auto max-w-2xl p-10 text-center">
    <div class="mx-auto h-20 w-20 animate-pulse rounded-full bg-accent/20"></div>
    <h1 class="mt-6 text-3xl font-bold text-brand">正在分析你的代码...</h1>
    <p class="mt-2 text-slate-500">任务 ID: {{ store.taskId }}</p>

    <div class="mt-8">
      <div class="h-3 overflow-hidden rounded-full bg-slate-200">
        <div class="h-full bg-gradient-to-r from-brand to-accent transition-all duration-500" :style="{ width: `${store.progress}%` }" />
      </div>
      <p class="mt-2 text-sm text-slate-600">{{ store.progress }}%</p>
    </div>

    <div class="mt-8 grid gap-3 text-left">
      <div v-for="step in store.status?.steps || []" :key="step.name" class="rounded-lg border border-slate-200 p-3">
        <div class="flex items-center justify-between">
          <span class="font-medium">{{ step.name }}</span>
          <span class="text-sm" :class="step.status === 'completed' ? 'text-green-600' : step.status === 'processing' ? 'text-brand' : 'text-slate-400'">{{ step.status }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
