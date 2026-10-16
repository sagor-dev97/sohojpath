<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import http from '../api/http'
import AdSlot from '../components/AdSlot.vue'
import RecentArticlesSection from '../components/RecentArticlesSection.vue'

const { t } = useI18n()
const jobs = ref([])
const quiz = ref(null)
const busy = ref(true)
const error = ref('')
const defaultBanners = [
  {
    id: 'opportunities', badge: 'শিখুন, প্রস্তুতি নিন, এগিয়ে যান', title: 'সুযোগ খুঁজুন,', highlight: 'এগিয়ে যান',
    description: 'চাকরির সার্কুলার, ভর্তি আপডেট আর প্রতিদিনের সাধারণ জ্ঞান—সব দরকারি তথ্য এক জায়গায়।',
    primary_label: 'চাকরি দেখুন', primary_link: '/jobs', secondary_label: 'জিকে অনুশীলন', secondary_link: '/gk', theme: 'emerald',
  },
  {
    id: 'students', badge: 'শ্রেণি ১–১০-এর শিক্ষার্থীদের জন্য', title: 'শিখি, খেলি,', highlight: 'স্বপ্ন গড়ি',
    description: 'প্রথম থেকে দশম শ্রেণি—প্রতিদিনের পড়া, কুইজ আর ছোট ছোট অনুশীলনে শেখা হোক আনন্দের।',
    primary_label: 'জিকে কুইজ দাও', primary_link: '/gk', secondary_label: 'শেখা শুরু করো', secondary_link: '/gk/exam-categories', theme: 'students',
  },
]
const cp1252Bytes = new Map([[0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97], [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]])
function repairMojibake(value) {
  if (typeof value !== 'string' || !/[à¦Ãâ€ðŸï¸]/u.test(value)) return value
  const bytes = []
  for (const character of value) {
    const codePoint = character.codePointAt(0)
    if (codePoint <= 0xff) bytes.push(codePoint)
    else if (cp1252Bytes.has(codePoint)) bytes.push(cp1252Bytes.get(codePoint))
    else return value
  }
  try {
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
    return /[\u0980-\u09ff]/u.test(decoded) && !/[à¦Ãâ€ðŸï¸]/u.test(decoded) ? decoded : value
  } catch {
    return value
  }
}

function repairBanner(banner) {
  return Object.fromEntries(Object.entries(banner).map(([key, value]) => [key, repairMojibake(value)]))
}
const banners = ref(defaultBanners)
const initialStudentBannerIndex = defaultBanners.findIndex((banner) => banner.theme === 'students')
const activeBannerIndex = ref(initialStudentBannerIndex === -1 ? 0 : initialStudentBannerIndex)
const activeBanner = computed(() => banners.value[activeBannerIndex.value] || defaultBanners[0])
let bannerTimer

function nextBanner() {
  if (banners.value.length > 1) activeBannerIndex.value = (activeBannerIndex.value + 1) % banners.value.length
}
function previousBanner() {
  if (banners.value.length > 1) activeBannerIndex.value = (activeBannerIndex.value - 1 + banners.value.length) % banners.value.length
}
function startBannerTimer() {
  window.clearInterval(bannerTimer)
  if (banners.value.length > 1) bannerTimer = window.setInterval(nextBanner, 7000)
}
function pauseBannerTimer() {
  window.clearInterval(bannerTimer)
}

onMounted(async () => {
  try {
    const { data } = await http.get('/home')
    jobs.value = data.latest_jobs?.data || data.latest_jobs || []
    quiz.value = data.daily_quiz
  } catch {
    error.value = t('home.loadError')
  } finally {
    busy.value = false
  }

  try {
    const { data } = await http.get('/home-banners')
    if (data.data?.length) {
      banners.value = data.data.map(repairBanner)
      const defaultIndex = banners.value.findIndex((banner) => banner.is_default)
      const studentIndex = banners.value.findIndex((banner) => banner.theme === 'students')
      activeBannerIndex.value = defaultIndex !== -1 ? defaultIndex : (studentIndex === -1 ? 0 : studentIndex)
    }
  } catch {
    banners.value = defaultBanners
    activeBannerIndex.value = initialStudentBannerIndex === -1 ? 0 : initialStudentBannerIndex
  }
  startBannerTimer()
})

onBeforeUnmount(pauseBannerTimer)
</script>

<template>
  <div class="container-page">
    <Transition name="banner-slide" mode="out-in">
      <section :key="activeBannerIndex" class="relative isolate mt-8 overflow-hidden rounded-[2rem] px-6 py-12 text-white shadow-xl md:mt-12 md:px-14 md:py-16 xl:grid xl:min-h-[390px] xl:grid-cols-[1.4fr_1fr] xl:items-center xl:gap-10" :class="activeBanner.theme === 'students' ? 'bg-gradient-to-br from-indigo-950 via-sky-900 to-emerald-900' : 'bg-emerald-950'" aria-roledescription="carousel" aria-label="Home banners" @mouseenter="pauseBannerTimer" @mouseleave="startBannerTimer" @focusin="pauseBannerTimer" @focusout="startBannerTimer">
        <span class="banner-orbit pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-white/10"></span>
        <span v-if="activeBanner.theme === 'students'" class="banner-orbit banner-orbit--second pointer-events-none absolute -bottom-40 right-1/4 size-96 rounded-full border border-cyan-200/10"></span>
        <div class="relative z-10 max-w-2xl xl:max-w-3xl">
          <span class="pill !border-white/15 !bg-white/10 text-emerald-100">{{ activeBanner.badge }}</span>
          <h1 class="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">{{ activeBanner.title }}<br><span class="text-emerald-300">{{ activeBanner.highlight }}</span></h1>
          <p class="mt-5 max-w-xl leading-7 text-emerald-50/80">{{ activeBanner.description }}</p>
          <div class="mt-8 flex flex-wrap gap-3"><RouterLink :to="activeBanner.primary_link" class="btn-light">{{ activeBanner.primary_label }} <span>?</span></RouterLink><RouterLink v-if="activeBanner.secondary_label" :to="activeBanner.secondary_link" class="btn-outline-light">{{ activeBanner.secondary_label }}</RouterLink></div>
        </div>
        <div v-if="activeBanner.theme === 'students'" class="relative mx-auto mt-10 grid min-h-56 w-full max-w-lg place-items-center xl:mt-0">
          <div class="banner-orbit banner-orbit--art absolute size-52 rounded-full border border-cyan-100/20"></div>
          <div class="banner-float absolute left-8 top-4 grid size-14 rotate-[-12deg] place-items-center rounded-2xl border border-white/20 bg-white/10 text-3xl shadow-lg backdrop-blur">✏️</div>
          <div class="banner-float banner-float--later absolute right-6 top-8 grid size-12 rotate-12 place-items-center rounded-2xl border border-white/20 bg-white/10 text-2xl shadow-lg backdrop-blur">⭐</div>
          <div class="relative grid size-48 place-items-center rounded-[2.5rem] border border-white/20 bg-white/10 text-center shadow-2xl backdrop-blur-md">
            <span class="absolute -right-5 -top-5 grid size-14 rotate-12 place-items-center rounded-2xl bg-amber-300 text-2xl shadow-lg">📐</span>
            <div><span class="text-5xl">📚</span><b class="mt-2 block text-3xl">শ্রেণি ১–১০</b><span class="mt-1 block text-xs text-cyan-100">প্রতিদিন একটু একটু করে</span></div>
          </div>
          <span class="banner-float absolute bottom-1 left-10 rounded-full border border-white/20 bg-indigo-500/70 px-4 py-2 text-sm font-bold shadow-lg">শেখা হোক আনন্দের ✨</span>
        </div>
        <div v-else class="relative mt-10 grid max-w-xl grid-cols-3 gap-3 md:absolute md:bottom-12 md:right-12 md:w-[360px] xl:static xl:mt-8 xl:ml-auto xl:w-full xl:max-w-lg">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4"><span class="text-2xl">📋</span><p class="mt-2 text-xs text-emerald-100/70">{{ $t('nav.jobs') }}</p></div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4"><span class="text-2xl">📚</span><p class="mt-2 text-xs text-emerald-100/70">{{ $t('home.practice') }}</p></div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4"><span class="text-2xl">🎯</span><p class="mt-2 text-xs text-emerald-100/70">{{ $t('home.heroLine2') }}</p></div>
        </div>
        <div v-if="banners.length > 1" class="relative z-10 mt-7 flex items-center justify-center gap-3 xl:absolute xl:bottom-5 xl:left-1/2 xl:mt-0 xl:-translate-x-1/2">
          <button type="button" class="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-sm transition hover:bg-white/20" aria-label="Previous banner" @click="previousBanner">←</button>
          <button v-for="(banner, index) in banners" :key="banner.id || index" type="button" class="h-2 rounded-full transition-all" :class="index === activeBannerIndex ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'" :aria-label="`Show banner ${index + 1}`" :aria-current="index === activeBannerIndex ? 'true' : undefined" @click="activeBannerIndex = index; startBannerTimer()"></button>
          <button type="button" class="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-sm transition hover:bg-white/20" aria-label="Next banner" @click="nextBanner">→</button>
        </div>
      </section>
    </Transition>
    <AdSlot slot="home" />
    <RecentArticlesSection :limit="12" />
    <section class="my-14 grid gap-5 md:grid-cols-[1fr_1.3fr]">
      <div class="surface bg-amber-50/80 p-7"><span class="eyebrow !text-amber-700">{{ $t('home.dailyChallenge') }}</span><h2 class="mt-2 text-2xl font-extrabold text-slate-900">{{ $t('home.playQuiz') }}</h2><p class="mt-2 text-sm leading-6 text-slate-600">{{ $t('home.challengeText') }}</p><RouterLink to="/gk" class="btn-primary mt-5">{{ $t('home.startQuiz') }} <span>?</span></RouterLink></div>
      <div class="surface flex items-center gap-5 p-7"><div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl">💡</div><div><p class="text-xs font-bold uppercase tracking-wide text-amber-700">{{ $t('home.todayQuestion') }}</p><p v-if="quiz" class="mt-1 font-bold text-slate-900">{{ quiz.question }}</p><p v-else class="mt-1 text-sm text-slate-500">{{ $t('home.questionSoon') }}</p><RouterLink to="/gk" class="mt-2 inline-block text-sm font-semibold text-emerald-700">{{ $t('home.answer') }} ?</RouterLink></div></div>
    </section>
    <section class="mt-14">
      <div class="mb-6 flex items-end justify-between"><div><span class="eyebrow">{{ $t('home.career') }}</span><h2 class="section-title">{{ $t('home.recentJobs') }}</h2></div><RouterLink class="text-sm font-bold text-emerald-700" to="/jobs">{{ $t('home.allJobs') }} <span>?</span></RouterLink></div>
      <p v-if="busy" class="surface p-8 text-center text-slate-500">{{ $t('home.jobsLoading') }}</p>
      <p v-else-if="error" class="surface p-8 text-center text-rose-600">{{ error }}</p>
      <div v-else-if="jobs.length" class="grid gap-4 md:grid-cols-2">
        <article v-for="job in jobs" :key="job.id" class="surface group p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <div class="flex items-start justify-between gap-3"><div><span class="pill">{{ job.employment_type || $t('home.jobType') }}</span><h3 class="mt-3 text-lg font-extrabold text-slate-900">{{ job.title }}</h3><p class="mt-1 text-sm text-slate-500">{{ job.organization }}</p></div><span class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-700">?</span></div>
          <div class="mt-5 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>📍 {{ job.location || $t('home.country') }}</span><span>{{ $t('home.deadline') }} {{ job.deadline || $t('home.notListed') }}</span></div>
          <RouterLink :to="{ name: 'job', params: { slug: job.slug } }" class="mt-4 inline-block text-sm font-bold text-emerald-700">{{ $t('home.details') }} ?</RouterLink>
        </article>
      </div>
      <div v-else class="surface p-10 text-center"><span class="text-3xl">🗂️?</span><h3 class="mt-3 font-bold">{{ $t('home.noJobs') }}</h3><p class="mt-1 text-sm text-slate-500">{{ $t('home.noJobsHint') }}</p></div>
    </section>
  </div>
</template>
