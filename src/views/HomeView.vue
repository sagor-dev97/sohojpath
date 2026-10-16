<script setup>
import { onMounted, ref } from 'vue'
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
})
</script>

<template>
  <div class="container-page">
    <section class="relative mt-8 overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-12 text-white md:mt-12 md:px-14 md:py-16">
      <div class="absolute -right-20 -top-24 size-80 rounded-full bg-emerald-700/30 blur-3xl"></div>
      <div class="relative max-w-2xl">
        <span class="pill !border-emerald-700 !bg-emerald-900 text-emerald-200">{{ $t('home.badge') }}</span>
        <h1 class="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">{{ $t('home.hero') }}<br><span class="text-emerald-300">{{ $t('home.heroLine2') }}</span></h1>
        <p class="mt-5 max-w-xl leading-7 text-emerald-100/80">{{ $t('home.intro') }}</p>
        <div class="mt-8 flex flex-wrap gap-3"><RouterLink to="/jobs" class="btn-light">{{ $t('home.seeJobs') }} <span>↗</span></RouterLink><RouterLink to="/gk" class="btn-outline-light">{{ $t('home.practice') }}</RouterLink></div>
      </div>
      <div class="relative mt-10 grid max-w-xl grid-cols-3 gap-3 md:absolute md:bottom-12 md:right-12 md:w-[360px]">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4"><span class="text-2xl">📋</span><p class="mt-2 text-xs text-emerald-100/70">{{ $t('nav.jobs') }}</p></div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4"><span class="text-2xl">📚</span><p class="mt-2 text-xs text-emerald-100/70">{{ $t('home.practice') }}</p></div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4"><span class="text-2xl">🎯</span><p class="mt-2 text-xs text-emerald-100/70">{{ $t('home.heroLine2') }}</p></div>
      </div>
    </section>

    <AdSlot slot="home" />
    <RecentArticlesSection :limit="3" />
    <section class="my-14 grid gap-5 md:grid-cols-[1fr_1.3fr]">
      <div class="surface bg-amber-50/80 p-7"><span class="eyebrow !text-amber-700">{{ $t('home.dailyChallenge') }}</span><h2 class="mt-2 text-2xl font-extrabold text-slate-900">{{ $t('home.playQuiz') }}</h2><p class="mt-2 text-sm leading-6 text-slate-600">{{ $t('home.challengeText') }}</p><RouterLink to="/gk" class="btn-primary mt-5">{{ $t('home.startQuiz') }} <span>→</span></RouterLink></div>
      <div class="surface flex items-center gap-5 p-7"><div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl">💡</div><div><p class="text-xs font-bold uppercase tracking-wide text-amber-700">{{ $t('home.todayQuestion') }}</p><p v-if="quiz" class="mt-1 font-bold text-slate-900">{{ quiz.question }}</p><p v-else class="mt-1 text-sm text-slate-500">{{ $t('home.questionSoon') }}</p><RouterLink to="/gk" class="mt-2 inline-block text-sm font-semibold text-emerald-700">{{ $t('home.answer') }} →</RouterLink></div></div>
    </section>
    <section class="mt-14">
      <div class="mb-6 flex items-end justify-between"><div><span class="eyebrow">{{ $t('home.career') }}</span><h2 class="section-title">{{ $t('home.recentJobs') }}</h2></div><RouterLink class="text-sm font-bold text-emerald-700" to="/jobs">{{ $t('home.allJobs') }} <span>→</span></RouterLink></div>
      <p v-if="busy" class="surface p-8 text-center text-slate-500">{{ $t('home.jobsLoading') }}</p>
      <p v-else-if="error" class="surface p-8 text-center text-rose-600">{{ error }}</p>
      <div v-else-if="jobs.length" class="grid gap-4 md:grid-cols-2">
        <article v-for="job in jobs" :key="job.id" class="surface group p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
          <div class="flex items-start justify-between gap-3"><div><span class="pill">{{ job.employment_type || $t('home.jobType') }}</span><h3 class="mt-3 text-lg font-extrabold text-slate-900">{{ job.title }}</h3><p class="mt-1 text-sm text-slate-500">{{ job.organization }}</p></div><span class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-700">↗</span></div>
          <div class="mt-5 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>📍 {{ job.location || $t('home.country') }}</span><span>{{ $t('home.deadline') }} {{ job.deadline || $t('home.notListed') }}</span></div>
          <RouterLink :to="{ name: 'job', params: { slug: job.slug } }" class="mt-4 inline-block text-sm font-bold text-emerald-700">{{ $t('home.details') }} →</RouterLink>
        </article>
      </div>
      <div v-else class="surface p-10 text-center"><span class="text-3xl">🗂️</span><h3 class="mt-3 font-bold">{{ $t('home.noJobs') }}</h3><p class="mt-1 text-sm text-slate-500">{{ $t('home.noJobsHint') }}</p></div>
    </section>
  </div>
</template>
