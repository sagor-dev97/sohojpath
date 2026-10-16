<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import http from '../../api/http'

const route = useRoute()
const article = ref(null)
const loading = ref(true)
const error = ref('')

async function loadArticle() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await http.get(`/articles/${encodeURIComponent(route.params.slug)}`)
    article.value = data.data || data
    document.title = `${article.value.title} — সহজপাঠ`
  } catch {
    article.value = null
    error.value = 'খবরটি পাওয়া যায়নি অথবা সরিয়ে নেওয়া হয়েছে।'
  } finally {
    loading.value = false
  }
}

onMounted(loadArticle)
watch(() => route.params.slug, loadArticle)
</script>

<template>
  <div class="container-page min-h-[60vh] py-10 md:py-14">
    <RouterLink to="/articles" class="text-sm font-semibold text-emerald-700">← সাম্প্রতিক খবরে ফিরুন</RouterLink>
    <p v-if="loading" class="surface mt-6 p-10 text-center text-slate-500">খবর লোড হচ্ছে…</p>
    <p v-else-if="error" class="surface mt-6 p-10 text-center text-slate-600">{{ error }}</p>
    <article v-else-if="article" class="surface mx-auto mt-6 max-w-4xl overflow-hidden">
      <img v-if="article.image_url" :src="article.image_url" :alt="article.title" class="max-h-[520px] w-full object-cover">
      <div class="p-6 md:p-10">
        <p class="text-sm font-semibold text-emerald-700">{{ article.published_at ? new Date(article.published_at).toLocaleDateString('bn-BD', { dateStyle: 'long' }) : '' }}</p>
        <h1 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 md:text-4xl">{{ article.title }}</h1>
        <p v-if="article.excerpt" class="mt-4 text-lg leading-8 text-slate-600">{{ article.excerpt }}</p>
        <div class="article-body prose mt-8 max-w-none leading-8 text-slate-700" v-html="article.body"></div>
      </div>
    </article>
  </div>
</template>
