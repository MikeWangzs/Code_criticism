<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { exportMarkdown, getAnalysisResult, shareReport } from '../../api';
import { useAnalysisStore } from '../../stores/analysis';
import ScoreRing from '../../components/ScoreRing.vue';

const router = useRouter();
const store = useAnalysisStore();
const loading = ref(false);
const filter = ref<'all' | 'error' | 'warning' | 'info'>('all');

const filteredIssues = computed(() => {
  if (!store.result) return [];
  if (filter.value === 'all') return store.result.issues;
  return store.result.issues.filter((item) => item.type === filter.value);
});

onMounted(async () => {
  if (!store.taskId) {
    router.replace('/upload');
    return;
  }

  if (store.result) return;

  loading.value = true;
  try {
    const data = await getAnalysisResult(store.taskId);
    store.setResult(data.result);
  } finally {
    loading.value = false;
  }
});

async function downloadMarkdown() {
  if (!store.taskId) return;
  const content = await exportMarkdown(store.taskId);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${store.taskId}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

async function createShareLink() {
  if (!store.taskId) return;
  const shared = await shareReport(store.taskId);
  await navigator.clipboard.writeText(shared.shareUrl);
  ElMessage.success('分享链接已复制到剪贴板');
}
</script>

<template>
  <section v-if="store.result" class="space-y-6">
    <header class="card p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-5">
          <ScoreRing :score="store.result.score" />
          <div>
            <h1 class="text-2xl font-bold text-brand">代码分析报告</h1>
            <p class="mt-1 text-slate-500">{{ store.result.summary }}</p>
            <p class="mt-2 text-sm text-slate-400">生成时间: {{ store.result.generatedAt }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="rounded-lg border border-brand px-4 py-2 text-brand" @click="downloadMarkdown">导出 Markdown</button>
          <button class="rounded-lg bg-brand px-4 py-2 text-white" @click="createShareLink">生成分享链接</button>
        </div>
      </div>

      <div class="mt-6 grid gap-3 md:grid-cols-4">
        <div class="rounded-lg bg-red-50 p-3 text-center">
          <p class="text-sm text-red-500">错误</p>
          <p class="text-2xl font-bold text-red-600">{{ store.result.issues.filter((i) => i.type === 'error').length }}</p>
        </div>
        <div class="rounded-lg bg-yellow-50 p-3 text-center">
          <p class="text-sm text-yellow-600">警告</p>
          <p class="text-2xl font-bold text-yellow-700">{{ store.result.issues.filter((i) => i.type === 'warning').length }}</p>
        </div>
        <div class="rounded-lg bg-blue-50 p-3 text-center">
          <p class="text-sm text-blue-600">建议</p>
          <p class="text-2xl font-bold text-blue-700">{{ store.result.issues.filter((i) => i.type === 'info').length }}</p>
        </div>
        <div class="rounded-lg bg-slate-50 p-3 text-center">
          <p class="text-sm text-slate-500">复杂度</p>
          <p class="text-2xl font-bold text-slate-700">{{ store.result.metrics.complexity }}</p>
        </div>
      </div>
    </header>

    <section class="card p-6">
      <div class="mb-4 flex gap-2">
        <button v-for="item in ['all', 'error', 'warning', 'info']" :key="item" class="rounded-full px-3 py-1 text-sm"
          :class="filter === item ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'" @click="filter = item as any">
          {{ item }}
        </button>
      </div>

      <div class="space-y-4">
        <article v-for="issue in filteredIssues" :key="issue.id" class="rounded-lg border-l-4 bg-white p-4"
          :class="issue.type === 'error' ? 'border-red-500' : issue.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ issue.message }}</h3>
            <span class="text-sm text-slate-500">第 {{ issue.line }} 行</span>
          </div>
          <pre v-if="issue.code" class="mt-2 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">{{ issue.code }}</pre>
          <p v-if="issue.suggestion" class="mt-2 text-sm text-emerald-700">建议修复: {{ issue.suggestion }}</p>
        </article>
      </div>
    </section>
  </section>

  <section v-else class="card p-10 text-center">
    <p class="text-slate-500">{{ loading ? '加载报告中...' : '暂无报告，请先提交分析任务。' }}</p>
    <router-link to="/upload" class="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-white">前往上传</router-link>
  </section>
</template>
