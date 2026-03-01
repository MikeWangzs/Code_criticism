import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AnalysisResult, AnalysisTaskStatus } from '../types';

export const useAnalysisStore = defineStore('analysis', () => {
  const fileId = ref('');
  const taskId = ref('');
  const status = ref<AnalysisTaskStatus | null>(null);
  const result = ref<AnalysisResult | null>(null);
  const language = ref('auto');

  const progress = computed(() => status.value?.progress ?? 0);
  const finished = computed(() => status.value?.status === 'completed');

  function setTask(nextFileId: string, nextTaskId: string) {
    fileId.value = nextFileId;
    taskId.value = nextTaskId;
  }

  function setStatus(nextStatus: AnalysisTaskStatus) {
    status.value = nextStatus;
  }

  function setResult(nextResult: AnalysisResult) {
    result.value = nextResult;
  }

  function reset() {
    fileId.value = '';
    taskId.value = '';
    status.value = null;
    result.value = null;
  }

  return {
    fileId,
    taskId,
    status,
    result,
    language,
    progress,
    finished,
    setTask,
    setStatus,
    setResult,
    reset,
  };
});
