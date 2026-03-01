<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { createAnalysisTask, getLanguages, uploadCodeFile, uploadCodeFolder, uploadCodeText } from '../../api';
import { useAnalysisStore } from '../../stores/analysis';

const router = useRouter();
const store = useAnalysisStore();

const code = ref('');
const selectedLanguage = ref('');
const file = ref<File | null>(null);
const folderFiles = ref<File[]>([]);
const languages = ref<Array<{ id: string; name: string }>>([]);
const loading = ref(false);

onMounted(async () => {
  languages.value = await getLanguages();
});

async function submit() {
  if (!folderFiles.value.length && !file.value && !code.value.trim()) {
    ElMessage.warning('请先选择文件夹/文件，或粘贴代码');
    return;
  }

  loading.value = true;
  try {
    if (folderFiles.value.length > 0) {
      const batch = await uploadCodeFolder(folderFiles.value, selectedLanguage.value || undefined);
      const task = await createAnalysisTask('', batch.fileIds);
      store.reset();
      store.setTask(batch.fileIds[0], task.taskId);
      router.push(`/analysis/${task.taskId}`);
      return;
    }

    const upload = file.value
      ? await uploadCodeFile(file.value, selectedLanguage.value || undefined)
      : await uploadCodeText({ code: code.value, language: selectedLanguage.value || undefined, fileName: 'snippet.txt' });

    const task = await createAnalysisTask(upload.fileId);
    store.reset();
    store.setTask(upload.fileId, task.taskId);
    router.push(`/analysis/${task.taskId}`);
  } catch (error) {
    ElMessage.error('提交失败，请检查后端服务是否启动');
  } finally {
    loading.value = false;
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
  if (file.value) {
    folderFiles.value = [];
  }
}

function onFolderChange(event: Event) {
  const input = event.target as HTMLInputElement;
  folderFiles.value = Array.from(input.files ?? []);
  if (folderFiles.value.length > 0) {
    file.value = null;
  }
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-bold text-brand">上传你的代码</h1>

    <div class="card p-6">
      <label class="block text-sm font-medium text-slate-600">文件夹上传</label>
      <input class="mt-2 block w-full rounded-lg border p-2" type="file" webkitdirectory directory multiple @change="onFolderChange" />
      <p class="mt-1 text-xs text-slate-500">可一次性选择整个项目文件夹并上传全部代码文件。</p>

      <div v-if="folderFiles.length" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        已选择文件夹，包含 {{ folderFiles.length }} 个文件
      </div>

      <div class="my-4 border-t border-dashed"></div>

      <label class="block text-sm font-medium text-slate-600">文件上传</label>
      <input class="mt-2 block w-full rounded-lg border p-2" type="file" @change="onFileChange" />
      <p class="mt-1 text-xs text-slate-500">支持常见代码文件，单文件最大 500KB。</p>

      <div v-if="file" class="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        已选择: {{ file.name }} ({{ (file.size / 1024).toFixed(1) }}KB)
      </div>

      <div class="my-4 text-center text-slate-400">或</div>

      <label class="block text-sm font-medium text-slate-600">粘贴代码</label>
      <textarea v-model="code" rows="12" class="mt-2 w-full rounded-lg border p-3 font-mono text-sm" placeholder="直接粘贴代码..."></textarea>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <el-select v-model="selectedLanguage" placeholder="自动检测" clearable style="width: 220px">
          <el-option v-for="lang in languages" :key="lang.id" :label="lang.name" :value="lang.id" />
        </el-select>
        <button class="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-60" :disabled="loading" @click="submit">
          {{ loading ? '提交中...' : '开始分析' }}
        </button>
      </div>
    </div>
  </section>
</template>
