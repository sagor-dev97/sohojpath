<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import http from '../api/http'

const props = defineProps({
  limit: { type: Number, default: 3 },
  title: { type: String, default: 'সাম্প্রতিক খবর' },
})
const articles = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await http.get('/articles', { params: { per_page: props.limit } })
    articles.value = data.data || []
  } catch {
    error.value = 'সাম্প্রতিক খবর এখন লোড করা যাচ্ছে না।'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section v-if="loading || error || articles.length" class="container-page py-7 md:py-10">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div><span class="eyebrow">সর্বশেষ আপডেট</span><h2 class="section-title">{{ title }}</h2></div>
      <RouterLink to="/articles" class="text-sm font-bold text-emerald-700">সব খবর দেখুন →</RouterLink>
    </div>
    <p v-if="loading" class="surface p-6 text-center text-sm text-slate-500">খবর লোড হচ্ছে…</p>
    <p v-else-if="error" class="surface p-6 text-center text-sm text-slate-500">{{ error }}</p>
    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="article in articles" :key="article.id" class="surface group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <RouterLink :to="{ name: 'article', params: { slug: article.slug } }" class="block">
          <img v-if="article.image_url" :src="article.image_url" :alt="article.title" class="h-48 w-full object-cover">
          <div class="p-5">
            <p class="text-xs font-semibold text-emerald-700">{{ article.published_at ? new Date(article.published_at).toLocaleDateString('bn-BD') : '' }}</p>
            <h3 class="mt-2 text-lg font-extrabold leading-7 text-slate-900 group-hover:text-emerald-800">{{ article.title }}</h3>
            <p v-if="article.excerpt" class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{{ article.excerpt }}</p>
            <span class="mt-4 inline-flex text-sm font-bold text-emerald-700">বিস্তারিত পড়ুন →</span>
          </div>
        </RouterLink>
      </article>
    </div>
  </section>
</template>
