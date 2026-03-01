<template>
  <section class="space-y-10">
    <div class="card overflow-hidden p-8 lg:p-12">
      <div class="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p class="badge bg-accent/10 text-accent">AI Code Review</p>
          <h1 class="mt-4 text-4xl font-black text-brand">让 AI 成为你的代码审查助手</h1>
          <p class="mt-4 text-lg text-slate-600">上传代码，秒获结构化问题报告和可执行修复建议。支持 C/C++、Python、JavaScript、TypeScript、Go、Rust。</p>
          <div class="mt-6 flex gap-4">
            <router-link class="rounded-lg bg-brand px-5 py-3 font-semibold text-white" to="/upload">开始免费分析</router-link>
            <router-link class="rounded-lg border border-brand px-5 py-3 font-semibold text-brand" to="/upload">查看示例</router-link>
          </div>
        </div>
        <pre class="rounded-xl bg-slate-900 p-5 text-sm text-cyan-300"><code>// Memory leak example
int* ptr = new int[100];
process(ptr);
// missing delete[] ptr;

// Suggestion:
std::vector&lt;int&gt; ptr(100);</code></pre>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <article class="card p-6">
        <h3 class="font-bold text-brand">智能分析</h3>
        <p class="mt-2 text-slate-600">静态规则 + AI 解释，给出为什么错和怎么改。</p>
      </article>
      <article class="card p-6">
        <h3 class="font-bold text-brand">多语言支持</h3>
        <p class="mt-2 text-slate-600">一套工作流覆盖主流后端与脚本语言。</p>
      </article>
      <article class="card p-6">
        <h3 class="font-bold text-brand">即时反馈</h3>
        <p class="mt-2 text-slate-600">分析进度实时展示，报告可导出可分享。</p>
      </article>
    </div>
  </section>
</template>
