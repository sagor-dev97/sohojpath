<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import http from '../api/http'

const props = defineProps({
  limit: { type: Number, default: 3 },
  title: { type: String, default: 'সাম্প্রতিক খবর' },
})
const articles = ref([])
const loading = ref(true)
const error = ref('')
const activeSlide = ref(0)
const slides = computed(() => {
  const pages = []
  for (let index = 0; index < articles.value.length; index += 4) {
    pages.push(articles.value.slice(index, index + 4))
  }
  return pages
})
const visibleArticles = computed(() => slides.value[activeSlide.value] || [])
function previousSlide() { activeSlide.value = (activeSlide.value - 1 + slides.value.length) % slides.value.length }
function nextSlide() { activeSlide.value = (activeSlide.value + 1) % slides.value.length }

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
    <div v-else class="grid gap-4">
      <Transition name="page-fade" mode="out-in">
        <div :key="activeSlide" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="article in visibleArticles" :key="article.id" class="surface group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
            <RouterLink :to="{ name: 'article', params: { slug: article.slug } }" class="block h-full">
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
      </Transition>
      <div v-if="slides.length > 1" class="flex items-center justify-center gap-4 pt-2">
        <button type="button" class="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-lg font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50" aria-label="Previous articles" @click="previousSlide">←</button>
        <span class="text-sm font-semibold text-slate-500">{{ activeSlide + 1 }} / {{ slides.length }}</span>
        <button type="button" class="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-lg font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50" aria-label="Next articles" @click="nextSlide">→</button>
      </div>
    </div>  </section>
</template>
