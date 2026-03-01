<template>
  <div class="min-h-screen bg-bg text-slate-800">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <router-link class="text-xl font-bold text-brand" to="/">Code Critic</router-link>
        <nav class="flex items-center gap-4 text-sm">
          <router-link to="/">首页</router-link>
          <router-link to="/upload">开始使用</router-link>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <router-view />
    </main>

    <footer class="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      © 2026 Code Critic · AI 代码批判工具
    </footer>
  </div>
</template>
