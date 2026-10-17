<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import http from '../api/http'

const props = defineProps({
  limit: { type: Number, default: 3 },
  title: { type: String, default: 'সাম্প্রতিক খবর' },
  contained: { type: Boolean, default: true },
})
const articles = ref([])
const loading = ref(true)
const error = ref('')
const activeSlide = ref(0)
let slideTimer
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
function pauseSlideTimer() { window.clearInterval(slideTimer) }
function startSlideTimer() {
  window.clearInterval(slideTimer)
  if (slides.value.length > 1) slideTimer = window.setInterval(nextSlide, 4500)
}

onMounted(async () => {
  try {
    const { data } = await http.get('/articles', { params: { per_page: props.limit } })
    articles.value = data.data || []
  } catch {
    error.value = 'সাম্প্রতিক খবর এখন লোড করা যাচ্ছে না।'
  } finally {
    loading.value = false
    startSlideTimer()
  }
})
onBeforeUnmount(() => window.clearInterval(slideTimer))
</script>

<template>
  <section v-if="loading || error || articles.length" :class="[props.contained ? 'container-page' : '', 'py-7 md:py-10']">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div><span class="eyebrow">সর্বশেষ আপডেট</span><h2 class="section-title">{{ title }}</h2></div>
      <RouterLink to="/articles" class="text-sm font-bold text-emerald-700">সব খবর দেখুন →</RouterLink>
    </div>
    <p v-if="loading" class="surface p-6 text-center text-sm text-slate-500">খবর লোড হচ্ছে…</p>
    <p v-else-if="error" class="surface p-6 text-center text-sm text-slate-500">{{ error }}</p>
    <div v-else class="group relative" @mouseenter="pauseSlideTimer" @mouseleave="startSlideTimer">
      <Transition name="banner-slide" mode="out-in">
        <div :key="activeSlide" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="article in visibleArticles" :key="article.id" class="surface group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-[0_16px_35px_rgb(15_23_42_/_10%)]">
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
      <button v-if="slides.length > 1" type="button" class="absolute left-0 top-1/2 z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-lg font-bold text-emerald-800 opacity-0 shadow-md transition-opacity hover:bg-emerald-50 group-hover:opacity-100 focus-visible:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-visible:pointer-events-auto max-sm:left-2 max-sm:translate-x-0 max-sm:opacity-100 max-sm:pointer-events-auto" aria-label="Previous articles" @click="previousSlide">‹</button>
      <button v-if="slides.length > 1" type="button" class="absolute right-0 top-1/2 z-10 grid size-10 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-lg font-bold text-emerald-800 opacity-0 shadow-md transition-opacity hover:bg-emerald-50 group-hover:opacity-100 focus-visible:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-visible:pointer-events-auto max-sm:right-2 max-sm:translate-x-0 max-sm:opacity-100 max-sm:pointer-events-auto" aria-label="Next articles" @click="nextSlide">›</button>
    </div>  </section>
</template>
