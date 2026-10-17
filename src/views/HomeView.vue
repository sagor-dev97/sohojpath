<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import http from '../api/http'
import AdSlot from '../components/AdSlot.vue'
import { motion, useReducedMotion } from 'motion-v'

const vReveal = {
  mounted(element, binding) {
    element.dataset.scrollReveal = binding.value || 'up'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      element.dataset.scrollVisible = 'true'
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        element.dataset.scrollVisible = 'true'
        observer.disconnect()
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' })
    element._scrollRevealObserver = observer
    observer.observe(element)
  },
  unmounted(element) { element._scrollRevealObserver?.disconnect() },
}
import RecentArticlesSection from '../components/RecentArticlesSection.vue'

const reduceMotion = useReducedMotion()

const { t, locale } = useI18n()
const todayLabel = computed(() => new Intl.DateTimeFormat(locale.value === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()))
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
    primary_label: 'কুইজ দাও', primary_link: '/gk', secondary_label: 'শেখা শুরু করো', secondary_link: '/gk/exam-categories', theme: 'students',
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

function goToBanner(index) {
  activeBannerIndex.value = index
}

function pauseBannerTimer() {
  window.clearInterval(bannerTimer)
}
function startBannerTimer() {
  window.clearInterval(bannerTimer)
  if (banners.value.length > 1) bannerTimer = window.setInterval(nextBanner, 4500)
}


function createBannerRipple(event) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ripple = document.createElement('span')
  ripple.className = 'water-ripple'
  ripple.style.left = `${event.clientX}px`
  ripple.style.top = `${event.clientY}px`
  document.body.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
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

onBeforeUnmount(() => window.clearInterval(bannerTimer))
</script>

<template>
  <div class="container-page">
    <div class="container-page">
    <Transition name="banner-slide" mode="out-in">
      <section :key="activeBannerIndex" class="banner-carousel relative isolate mt-8 overflow-hidden rounded-[2rem] px-6 py-12 text-white shadow-xl md:mt-12 md:px-14 md:py-16 xl:grid xl:min-h-[390px] xl:grid-cols-[1.4fr_1fr] xl:items-center xl:gap-10" :class="activeBanner.theme === 'students' ? 'bg-gradient-to-br from-indigo-950 via-sky-900 to-emerald-900' : 'bg-emerald-950'" aria-roledescription="carousel" aria-label="Home banners" @click="createBannerRipple" @mouseenter="pauseBannerTimer" @mouseleave="startBannerTimer">
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
        <div v-else class="job-banner-art relative mx-auto mt-10 grid min-h-64 w-full max-w-lg place-items-center xl:mt-0" aria-hidden="true">
          <span class="job-banner-glow absolute size-64 rounded-full bg-emerald-400/15 blur-3xl"></span>
          <span class="job-banner-ring absolute size-60 rounded-full border border-emerald-100/15"></span>
          <span class="job-banner-ring job-banner-ring--outer absolute size-72 rounded-full border border-white/10"></span>
          <div class="job-banner-float job-banner-float--left absolute left-2 top-8 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md sm:left-8">
            <span class="mb-2 block text-xs font-semibold text-emerald-100/75">{{ $t('home.career') }}</span>
            <span class="flex items-center gap-2"><span class="grid size-8 place-items-center rounded-lg bg-amber-300 text-emerald-950">↗</span><span class="text-sm font-bold">{{ $t('nav.jobs') }}</span></span>
          </div>
          <div class="job-banner-float job-banner-float--right absolute right-1 top-12 rounded-2xl border border-white/15 bg-slate-950/35 px-4 py-3 shadow-xl backdrop-blur-md sm:right-6">
            <span class="flex items-center gap-2 text-xs font-semibold"><span class="size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]"></span>{{ $t('home.recentJobs') }}</span>
          </div>
          <div class="job-banner-case relative grid size-40 place-items-center rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-emerald-300/25 to-teal-500/10 shadow-[0_24px_80px_rgba(0,0,0,.25)] backdrop-blur-xl sm:size-48">
            <span class="job-banner-case__shine absolute inset-2 rounded-[2rem] border border-white/10"></span>
            <svg class="job-banner-case__icon relative z-10 size-20 text-emerald-100 sm:size-24" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="13" y="31" width="70" height="49" rx="11" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="4" />
              <path d="M35 31V23a7 7 0 0 1 7-7h12a7 7 0 0 1 7 7v8M13 49h70M39 48v9h18v-9" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="m67 20 4 4 8-9" stroke="#fde68a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="job-banner-spark job-banner-spark--one absolute right-5 top-5 text-amber-200">✦</span>
            <span class="job-banner-spark job-banner-spark--two absolute bottom-7 left-5 text-emerald-200">✧</span>
          </div>
          <div class="job-banner-float job-banner-float--bottom absolute bottom-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-emerald-50 shadow-lg backdrop-blur-md">{{ $t('home.seeJobs') }} <span class="ml-1 text-amber-200">✦</span></div>
        </div>
        <div v-if="banners.length > 1" class="banner-controls" role="group" aria-label="Banner carousel controls" @click.stop>
          <button class="banner-control-button" type="button" aria-label="Previous banner" @click="previousBanner" @mouseenter="pauseBannerTimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6M9 12h12" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="banner-control-dots" aria-label="Choose a banner">
            <button v-for="(banner, index) in banners" :key="banner.id" class="banner-control-dot" :class="{ 'is-active': index === activeBannerIndex }" type="button" :aria-label="`Show banner ${index + 1}`" :aria-current="index === activeBannerIndex ? 'true' : undefined" @click="goToBanner(index)" @mouseenter="pauseBannerTimer"></button>
          </div>
          <button class="banner-control-button" type="button" aria-label="Next banner" @click="nextBanner" @mouseenter="pauseBannerTimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6m6 6H3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
            </section>
    </Transition>
    <AdSlot slot="home" />
    <div v-reveal="'up'"><RecentArticlesSection :limit="12" :contained="false" /></div>
    <section class="my-14 grid gap-6 md:grid-cols-2">
      <motion.div :initial="reduceMotion ? { opacity: 1, x: 0, rotate: 0, scale: 1 } : { opacity: 0, x: -190, y: 24, rotate: -4, scale: 0.86 }" :whileInView="{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }" :inViewOptions="{ once: false, amount: 0.3 }" :transition="{ type: 'spring', stiffness: 105, damping: 16, mass: 0.9 }" class="surface relative isolate flex min-h-[270px] flex-col overflow-hidden rounded-[2rem] border-white bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,.09)] md:p-6">
        <div class="relative z-10 flex items-center gap-4">
          <motion.span class="grid size-16 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true" :animate="reduceMotion ? {} : { rotate: [-4, 4, -4], scale: [1, 1.04, 1] }" :transition="{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }"><svg class="size-10" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17 12 11a4 4 0 0 0-7 1L2 22a8 8 0 0 0 2 9l6 6a5 5 0 0 0 8-2l3-7h6l3 7a5 5 0 0 0 8 2l6-6a8 8 0 0 0 2-9l-3-10a4 4 0 0 0-7-1l-4 6H16Z"/><path d="M12 20v8m-4-4h8m16-2h.1m5 5h.1"/></svg></motion.span>
          <div><h2 class="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">{{ $t('home.playQuiz') }}</h2><span class="mt-2 block h-1 w-20 rounded-full bg-emerald-600"></span></div>
        </div>
        <p class="relative z-10 mt-4 max-w-lg text-sm leading-6 text-slate-600 md:text-base">{{ $t('home.challengeText') }}</p>
        <motion.div aria-hidden="true" class="relative mt-2 flex flex-1 items-center justify-center overflow-hidden" :animate="reduceMotion ? {} : { y: [0, -3, 0] }" :transition="{ duration: 4, repeat: Infinity, ease: 'easeInOut' }">
          <svg class="h-[118px] w-full max-w-[390px] md:h-[128px]" viewBox="0 0 390 160" fill="none" role="img" aria-label="Books, an open notebook, and a plant" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="book-teal-cover" x1="30" y1="40" x2="150" y2="98" gradientUnits="userSpaceOnUse"><stop stop-color="#68C5B8"/><stop offset="1" stop-color="#15928F"/></linearGradient>
              <linearGradient id="book-blue-cover" x1="18" y1="62" x2="164" y2="116" gradientUnits="userSpaceOnUse"><stop stop-color="#65A8E9"/><stop offset="1" stop-color="#317BC5"/></linearGradient>
              <linearGradient id="book-bottom-cover" x1="16" y1="92" x2="178" y2="143" gradientUnits="userSpaceOnUse"><stop stop-color="#63C1B4"/><stop offset="1" stop-color="#188889"/></linearGradient>
              <linearGradient id="paper" x1="145" y1="76" x2="300" y2="132" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset=".52" stop-color="#F7FBFC"/><stop offset="1" stop-color="#E9F3F5"/></linearGradient>
              <linearGradient id="leaf" x1="320" y1="13" x2="365" y2="63" gradientUnits="userSpaceOnUse"><stop stop-color="#8BC77E"/><stop offset="1" stop-color="#378A55"/></linearGradient>
              <linearGradient id="pot" x1="321" y1="94" x2="356" y2="137" gradientUnits="userSpaceOnUse"><stop stop-color="#F5DDC0"/><stop offset="1" stop-color="#D9B895"/></linearGradient>
              <filter id="soft-shadow" x="0" y="0" width="390" height="160" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="3"/></filter>
            </defs>
            <ellipse cx="191" cy="145" rx="182" ry="7" fill="#DCEFE9"/>
            <ellipse cx="93" cy="135" rx="77" ry="7" fill="#759B9A" opacity=".12" filter="url(#soft-shadow)"/>
            <ellipse cx="237" cy="137" rx="78" ry="8" fill="#678F91" opacity=".13" filter="url(#soft-shadow)"/>
            <!-- softly rounded stack of colorful books -->
            <path d="m19 99 82-23 76 17-85 28-73-22Z" fill="url(#book-bottom-cover)" stroke="#238C8B" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="m20 99 72 22v14c0 4-3 6-7 5l-61-18c-3-1-5-4-5-7V99Z" fill="#F7FFFF" stroke="#238C8B" stroke-width="2.5"/>
            <path d="m92 121 85-28v13c0 3-2 5-5 6l-80 28v-19Z" fill="#218887"/>
            <path d="m26 104 59 18m-54-12 53 17m17-6 68-22" stroke="#D6E5E4" stroke-width="2" stroke-linecap="round"/>
            <path d="m23 72 78-22 72 18-82 27-68-23Z" fill="url(#book-blue-cover)" stroke="#397DB8" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="m24 72 67 23v15c0 3-2 5-5 4L30 96c-4-1-6-4-6-8V72Z" fill="#F8FCFF" stroke="#397DB8" stroke-width="2.5"/>
            <path d="m91 95 82-27v14c0 3-2 5-5 6l-77 26V95Z" fill="#2E70AD"/>
            <path d="m31 78 54 18m-49-11 49 16m16-6 66-22" stroke="#D7E8F7" stroke-width="2" stroke-linecap="round"/>
            <path d="m29 45 75-21c3-1 7-1 10 0l54 13c5 1 5 5 0 7L96 68 31 53c-6-1-7-6-2-8Z" fill="url(#book-teal-cover)" stroke="#268E8C" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="m31 51 61 17v13c0 3-2 5-5 4L36 70c-4-1-6-4-6-8V51Z" fill="#F8FFFF" stroke="#268E8C" stroke-width="2.5"/>
            <path d="m92 68 76-24v14c0 3-2 5-5 6L92 87V68Z" fill="#218986"/>
            <path d="m39 56 46 13m-41-6 41 13m17-8 59-19" stroke="#D7EFEC" stroke-width="2" stroke-linecap="round"/>
            <path d="M38 48c22-6 45-13 66-18 4-1 7-1 11 0" stroke="#A9E5DC" stroke-width="2" stroke-linecap="round" opacity=".8"/>
            <!-- open illustrated notebook with curved pages and paper details -->
            <path d="m145 91 58-22c9-4 19-4 28 0l73 23-4 45-68-22c-8-3-16-3-24 0l-62 23-1-47Z" fill="#4A8F9A" opacity=".18"/>
            <path d="m145 82 58-24c9-4 19-4 28 0l73 24-3 47-69-21c-8-2-16-2-24 1l-62 22-1-49Z" fill="url(#paper)" stroke="#338F99" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="m145 82 1 49 62-22c8-3 16-3 24-1l-1-50c-9-4-19-4-28 0l-58 24Z" fill="#FFF" opacity=".82"/>
            <path d="M231 58c-1 14-1 34 1 50m-75-19 36-16m-35 25 33-15m-31 25 30-14m-28 23 26-12m25-33 44 15m-43-5 41 14m-41-3 39 14m-39-3 36 13" stroke="#D9E7E8" stroke-width="2" stroke-linecap="round"/>
            <path d="M207 109c8-3 16-3 24-1m-28 4c8-3 16-3 24-1" stroke="#A9D4D7" stroke-width="1.5" stroke-linecap="round"/>
            <path d="m143 84 3-2m-3 12 3-2m-3 12 3-2m-3 12 3-2" stroke="#278B91" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M229 57c2 17 2 34 3 50" stroke="#B8D7DA" stroke-width="2" stroke-linecap="round"/>
            <!-- leafy desk plant -->
            <path d="M339 101c-4-22-8-45-14-68m14 47c-15-7-24-19-26-37 17 5 27 17 27 36m-12-25c-1-20 7-33 23-41 2 19-5 33-20 43m17-21c9-15 21-22 37-21-7 17-19 25-37 25m-23-5c-11-10-16-21-15-35 14 8 21 20 19 35" fill="url(#leaf)" stroke="#4F9A61" stroke-width="2" stroke-linejoin="round"/>
            <path d="m338 79-13-27m16 17 10-34m1 27 21-20m-41 13-10-23" stroke="#B5DB9D" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>
            <path d="m321 92 38 1-5 40c-.3 3-2 5-5 5h-21c-3 0-5-2-5-5l-2-41Z" fill="url(#pot)" stroke="#C6A27D" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M321 96h38m-34 5h30m-25 26h17" stroke="#FFF3E4" stroke-width="3" stroke-linecap="round"/>
            <ellipse cx="340" cy="93" rx="19" ry="4" fill="#8D6448"/><path d="M326 93c5-4 23-4 29 0" stroke="#C49A75" stroke-width="2"/>
          </svg>
        </motion.div>
        <RouterLink to="/gk" class="btn-primary relative z-10 mt-3 w-full justify-center rounded-2xl bg-emerald-600 py-3 text-sm shadow-md shadow-emerald-800/15 hover:bg-emerald-700">{{ $t('home.startQuiz') }} <span aria-hidden="true" class="text-xl">&#8594;</span></RouterLink>
      </motion.div>
      <motion.div :initial="reduceMotion ? { opacity: 1, x: 0, rotate: 0, scale: 1 } : { opacity: 0, x: 190, y: 24, rotate: 4, scale: 0.86 }" :whileInView="{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }" :inViewOptions="{ once: false, amount: 0.3 }" :transition="{ type: 'spring', stiffness: 105, damping: 16, mass: 0.9 }" class="surface relative isolate flex min-h-[270px] flex-col overflow-hidden rounded-[2rem] border-white bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,.09)] md:p-6">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div class="flex min-w-0 items-center gap-3"><motion.span class="grid size-14 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-700" aria-hidden="true" :animate="reduceMotion ? {} : { y: [0, -3, 0] }" :transition="{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }"><svg class="size-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="24" height="22" rx="3"/><path d="M10 3v6m12-6v6M4 12h24m-15 7 3 3 6-7"/></svg></motion.span><div class="min-w-0"><h2 class="truncate text-lg font-extrabold text-violet-800 md:text-xl">{{ $t('home.todayQuestion') }}</h2><p class="text-sm text-slate-500">{{ todayLabel }}</p></div></div>
          <motion.span class="grid size-14 shrink-0 place-items-center rounded-full bg-amber-100 text-4xl font-black text-amber-500" aria-hidden="true" :animate="reduceMotion ? {} : { scale: [1, 1.06, 1], rotate: [-3, 3, -3] }" :transition="{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }">?</motion.span>
        </div>
        <div class="mt-4 flex-1">
          <span class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"><svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h14v3l2 3v2a3 3 0 0 1-3 3h-1l-2-3-3 3-3-3-2 3H6a3 3 0 0 1-3-3V9l2-3V3Zm2 0v3h10V3H7Zm4 12h2v6h-2v-6Z"/></svg>{{ $t('quiz.general') }}</span>
          <h3 v-if="quiz" class="mt-3 text-lg font-extrabold leading-snug text-slate-950 md:text-xl">{{ quiz.question }}</h3>
          <p v-else class="mt-3 text-sm font-semibold text-slate-600">{{ $t('home.questionSoon') }}</p>
        </div>
        <div class="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></span><div><p class="text-xs text-slate-500">{{ $t('home.answer') }}</p><p class="text-sm font-bold text-slate-800">{{ todayLabel }}</p></div></div>
        <RouterLink to="/gk" class="mt-3 flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50"><span class="flex items-center gap-3"><svg class="size-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9M14 3v5h5M21 3l-9 9m0 0v4h4"/></svg>{{ $t('home.answer') }}</span><span aria-hidden="true" class="text-xl text-slate-500">&#8250;</span></RouterLink>
      </motion.div>
    </section>
    <section v-reveal="'up'" class="mt-14">
      <div class="mb-6 flex items-end justify-between"><div><span class="eyebrow">{{ $t('home.career') }}</span><h2 class="section-title">{{ $t('home.recentJobs') }}</h2></div><RouterLink class="text-sm font-bold text-emerald-700" to="/jobs">{{ $t('home.allJobs') }} <span>?</span></RouterLink></div>
      <p v-if="busy" class="surface p-8 text-center text-slate-500">{{ $t('home.jobsLoading') }}</p>
      <p v-else-if="error" class="surface p-8 text-center text-rose-600">{{ error }}</p>
      <div v-else-if="jobs.length" class="grid gap-4 md:grid-cols-2">
        <article v-for="(job, index) in jobs" :key="job.id" v-reveal="index % 2 === 0 ? 'left' : 'right'" class="surface group p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <div class="flex items-start justify-between gap-3"><div><span class="pill">{{ job.employment_type || $t('home.jobType') }}</span><h3 class="mt-3 text-lg font-extrabold text-slate-900">{{ job.title }}</h3><p class="mt-1 text-sm text-slate-500">{{ job.organization }}</p></div><span class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-700">?</span></div>
          <div class="mt-5 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>📍 {{ job.location || $t('home.country') }}</span><span>{{ $t('home.deadline') }} {{ job.deadline || $t('home.notListed') }}</span></div>
          <RouterLink :to="{ name: 'job', params: { slug: job.slug } }" class="mt-4 inline-block text-sm font-bold text-emerald-700">{{ $t('home.details') }} ?</RouterLink>
        </article>
      </div>
      <div v-else class="surface p-10 text-center"><span class="text-3xl">🗂️?</span><h3 class="mt-3 font-bold">{{ $t('home.noJobs') }}</h3><p class="mt-1 text-sm text-slate-500">{{ $t('home.noJobsHint') }}</p></div>
    </section>
    </div>
  </div>
</template>

<style scoped>
[data-scroll-reveal] { opacity: 0; transition: opacity 680ms ease, transform 680ms cubic-bezier(.2,.75,.25,1); will-change: opacity, transform; }
[data-scroll-reveal="up"] { transform: translate3d(0, 28px, 0); }
[data-scroll-reveal="left"] { transform: translate3d(-42px, 0, 0); }
[data-scroll-reveal="right"] { transform: translate3d(42px, 0, 0); }
[data-scroll-visible="true"] { opacity: 1; transform: translate3d(0, 0, 0); }
@media (prefers-reduced-motion: reduce) { [data-scroll-reveal] { opacity: 1; transform: none; transition: none; } }
</style>
