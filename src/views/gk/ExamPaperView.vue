<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../../api/http'
import { getAccessToken } from '../../api/auth'

const route = useRoute()
const router = useRouter()
const token = ref('')
const questions = ref([])
const answers = ref({})
const config = ref({})
const result = ref(null)
const expiry = ref(0)
const startedAt = ref(0)
const submittedAt = ref(0)
const now = ref(Date.now())
const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const pendingQuestionIds = ref([])
const saving = ref(false)
const saved = ref(false)
let interval
let autoSubmitStarted = false
let answerSaveQueue = Promise.resolve()

const seconds = computed(() => Math.max(0, Math.ceil((expiry.value - now.value) / 1000)))
const displayedScore = computed(() => {
  const score = Number(result.value?.score)
  return Number.isFinite(score) ? score : 0
})
const answeredCount = computed(() => Number(result.value?.total_questions || questions.value.length) - Number(result.value?.unanswered_count || 0))
const percentage = computed(() => {
  const total = Number(result.value?.total_marks || result.value?.total_questions || questions.value.length)
  return total ? (displayedScore.value / total) * 100 : 0
})
const durationLabel = computed(() => {
  const elapsed = submittedAt.value && startedAt.value
    ? Math.max(0, Math.floor((submittedAt.value - startedAt.value) / 1000))
    : 0
  return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
})
const clock = computed(() => `${String(Math.floor(seconds.value / 60)).padStart(2, '0')}:${String(seconds.value % 60).padStart(2, '0')}`)

function number(i) {
  return config.value.numbering_style === 'bangla'
    ? String(i + 1).replace(/[0-9]/g, n => '০১২৩৪৫৬৭৮৯'[n])
    : i + 1
}

async function choose(questionId, key) {
  if (answers.value[questionId] || seconds.value === 0 || submitting.value) return
  answers.value = { ...answers.value, [questionId]: key }
  pendingQuestionIds.value = [...pendingQuestionIds.value, questionId]
  error.value = ''

  const answerRequest = answerSaveQueue.catch(() => {}).then(async () => {
    await http.put(`/gk/exams/${encodeURIComponent(token.value)}/answers`, { answers: { [questionId]: key } })
    error.value = ''
  }).catch(async requestError => {
    try {
      const { data } = await http.get(`/gk/exams/${encodeURIComponent(token.value)}`)
      const serverAnswers = data.answers || {}
      answers.value = { ...answers.value, ...serverAnswers }
    } catch {
      delete answers.value[questionId]
      answers.value = { ...answers.value }
    }
    error.value = requestError.response?.data?.message || 'উত্তর সংরক্ষণ হয়নি। আবার চেষ্টা করুন।'
  }).finally(() => {
    pendingQuestionIds.value = pendingQuestionIds.value.filter(id => id !== questionId)
  })

  answerSaveQueue = answerRequest
}

async function submit() {
  if (result.value || !token.value || submitting.value || pendingQuestionIds.value.length) return
  submitting.value = true
  error.value = ''
  try {
    await answerSaveQueue
    const submittedAnswers = { ...answers.value }
    const { data } = await http.post(`/gk/exams/${encodeURIComponent(token.value)}/submit`, { answers: submittedAnswers })
    if (!data.result) throw new Error('ফলাফল পাওয়া যায়নি। আবার Submit করুন।')
    submittedAt.value = Date.now()
    result.value = data.result
    saved.value = data.saved
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'ফলাফল জমা হয়নি। আবার চেষ্টা করুন।'
  } finally {
    submitting.value = false
  }
}

async function save() {
  if (saving.value) return
  if (!getAccessToken()) {
    await router.push({ name: 'account', query: { redirect: route.fullPath + '?save=1' } })
    return
  }
  saving.value = true
  try {
    await http.post(`/gk/exams/${encodeURIComponent(token.value)}/save`)
    saved.value = true
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'ফলাফল সংরক্ষণ হয়নি।'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await http.post(`/gk/exam-papers/${route.params.paperId}/start`)
    token.value = data.exam_token
    questions.value = data.questions
    config.value = data.exam_config
    startedAt.value = data.started_at ? new Date(data.started_at).getTime() : Date.now()
    expiry.value = new Date(data.expires_at).getTime()
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'পরীক্ষা শুরু করা যায়নি।'
  } finally {
    loading.value = false
  }
  interval = setInterval(() => {
    now.value = Date.now()
    if (!loading.value && !result.value && seconds.value === 0 && pendingQuestionIds.value.length === 0 && !submitting.value && !autoSubmitStarted) {
      autoSubmitStarted = true
      submit()
    }
  }, 500)
})

onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <main class="container-page py-8">
    <div class="mx-auto max-w-5xl">
      <header class="mb-5 grid grid-cols-3 items-center rounded-2xl border bg-white p-4">
        <RouterLink to="/" class="font-extrabold text-emerald-800">সহজপাঠ</RouterLink>
        <h1 class="text-center font-black md:text-xl">{{ config.title || 'MCQ পরীক্ষা' }}</h1>
        <b class="text-right font-mono text-rose-700">{{ clock }}</b>
      </header>

      <p v-if="loading" class="surface p-10 text-center">পরীক্ষা প্রস্তুত হচ্ছে…</p>
      <p v-else-if="error && !questions.length" class="surface p-8 text-center text-rose-700">{{ error }} <RouterLink to="/gk/exam-categories" class="font-bold">বিভাগে ফিরুন</RouterLink></p>

      <template v-else-if="result">
        <section class="surface mb-5 p-6 md:p-8">
          <p class="text-center text-sm font-bold text-emerald-700">পরীক্ষার ফলাফল</p>
          <div class="my-5 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div class="result-stat result-stat--score"><span>মোট নম্বর</span><strong>{{ displayedScore }} / {{ result.total_marks }}</strong></div>
            <div class="result-stat result-stat--correct"><span>সঠিক</span><strong>{{ result.correct_count }}</strong></div>
            <div class="result-stat result-stat--wrong"><span>ভুল</span><strong>{{ result.wrong_count }}</strong></div>
            <div class="result-stat result-stat--unanswered"><span>উত্তর দাওনি</span><strong>{{ result.unanswered_count }}</strong></div>
            <div class="result-stat result-stat--time"><span>সময় নিয়েছ</span><strong>{{ durationLabel }}</strong></div>
          </div>
          <div class="rounded-xl bg-slate-100 p-4">
            <div class="mb-2 flex items-center justify-between text-sm font-bold text-slate-700"><span>স্কোরের শতাংশ</span><span>{{ percentage.toFixed(1) }}%</span></div>
            <div class="h-3 overflow-hidden rounded-full bg-white"><div class="h-full rounded-full bg-emerald-600 transition-all" :style="{ width: `${Math.max(0, Math.min(100, percentage))}%` }"></div></div>
          </div>
        </section>

        <section class="mb-5 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">সবুজ: সঠিক উত্তর</div>
          <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">লাল: ভুল উত্তর</div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">কমলা: উত্তর দেওয়া হয়নি</div>
        </section>

        <section class="grid gap-3">
          <article v-for="item in result.answer_review || []" :key="item.number" class="answer-review" :class="`answer-review--${item.status}`">
            <b>{{ item.number }}. {{ item.question }}</b>
            <p v-if="item.status === 'unanswered'" class="mt-2 font-semibold text-amber-800">আপনি উত্তর দেননি</p>
            <p v-else class="mt-2" :class="item.status === 'correct' ? 'text-emerald-800' : 'text-rose-800'">আপনার উত্তর: {{ item.selected_answer }}</p>
            <p v-if="item.status !== 'correct'" class="mt-1 font-semibold text-emerald-800">সঠিক উত্তর: {{ item.correct_answer }}</p>
            <p v-if="item.explanation" class="mt-2 border-t border-current/10 pt-2 text-sm text-slate-600">{{ item.explanation }}</p>
          </article>
        </section>

        <div class="mt-5 flex justify-center gap-3">
          <button v-if="!saved" class="btn-primary inline-flex items-center gap-2" :disabled="saving" @click="save"><span v-if="saving" class="loading-spinner" aria-hidden="true"></span>{{ saving ? 'ফলাফল সংরক্ষণ হচ্ছে…' : 'Save this record' }}</button>
          <RouterLink v-else to="/profile" class="btn-primary">Profile দেখুন</RouterLink>
          <RouterLink to="/gk/exam-categories" class="rounded-xl border px-4 py-3">বিভাগে ফিরুন</RouterLink>
        </div>
        <p v-if="error" class="mt-4 text-center text-rose-700">{{ error }}</p>
      </template>

      <template v-else>
        <div class="mx-auto max-w-5xl">
          <div v-if="config.notice_text" class="notice-marquee mb-4 overflow-hidden rounded-xl border border-rose-200 bg-rose-50 py-2 text-sm font-bold text-rose-800"><div class="notice-marquee__track w-max whitespace-nowrap px-4">{{ config.notice_text }}</div></div>
          <section class="panel relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-12">
            <span v-if="config.watermark" class="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden text-6xl font-black text-slate-200/40" style="transform:rotate(-30deg)">{{ config.watermark }}</span>
            <header class="relative mb-7 border-b pb-4 text-center"><p v-if="config.category_name" class="text-sm text-slate-600">{{ config.category_name }}</p><h1 class="mt-1 text-xl font-black text-slate-900 md:text-2xl">{{ config.title || 'MCQ Exam' }}</h1><p class="mt-1 text-sm text-slate-700">Duration: {{ config.duration_minutes }} minutes | Questions: {{ questions.length }}</p></header>
            <div class="relative grid gap-5" :class="[2, 5].includes(Number(config.layout_template)) ? 'md:grid-cols-2' : 'grid-cols-1'">
              <article v-for="(q, i) in questions" :key="q.id" class="break-inside-avoid text-sm">
                <p class="font-bold leading-6 text-slate-900">{{ number(i) }}. {{ q.question }}</p>
                <div class="mt-2 grid grid-cols-2 gap-1">
                  <label v-for="key in ['a', 'b', 'c', 'd']" :key="key" class="flex min-h-8 items-start gap-1.5 rounded-md px-1.5 py-1 text-sm leading-6 transition-colors" :class="[answers[q.id] === key ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-800', answers[q.id] || seconds === 0 ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50']">
                    <input class="sr-only" type="radio" :name="'q' + q.id" :value="key" :checked="answers[q.id] === key" :disabled="!!answers[q.id] || seconds === 0 || submitting" @change="choose(q.id, key)">
                    <span class="option-check mt-1" :class="{ 'option-check--selected': answers[q.id] === key }" aria-hidden="true">{{ answers[q.id] === key ? (pendingQuestionIds.includes(q.id) ? '…' : '✓') : '' }}</span>
                    <span v-if="config.option_style === 'alphabet'" class="shrink-0" :class="answers[q.id] === key ? 'text-emerald-800' : ''">{{ key.toUpperCase() }})</span>
                    <span>{{ q['option_' + key] }}</span>
                  </label>
                </div>
              </article>
            </div>
          </section>
          <div class="mt-5 text-center">
            <button class="btn-primary inline-flex items-center gap-2" :disabled="seconds === 0 || submitting || pendingQuestionIds.length > 0" @click="submit"><span v-if="submitting || pendingQuestionIds.length" class="loading-spinner" aria-hidden="true"></span>{{ pendingQuestionIds.length ? 'উত্তর সংরক্ষণ হচ্ছে (' + pendingQuestionIds.length + ')…' : submitting ? 'ফলাফল তৈরি হচ্ছে…' : 'Submit exam' }}</button>
            <p class="mt-2 text-xs text-slate-500">উত্তরগুলো একে একে সংরক্ষণ হচ্ছে; সব সংরক্ষণ হলে Submit চালু হবে।</p>
            <p v-if="error" class="mt-3 text-sm text-rose-700">{{ error }}</p>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.loading-spinner { width: 1rem; height: 1rem; border: 2px solid currentColor; border-right-color: transparent; border-radius: 9999px; animation: exam-spinner .7s linear infinite; }
@keyframes exam-spinner { to { transform: rotate(360deg); } }
.option-check { display: inline-grid; width: 1rem; height: 1rem; flex: 0 0 1rem; place-items: center; border: 1.5px solid #94a3b8; border-radius: 9999px; color: #047857; font-size: .7rem; font-weight: 900; line-height: 1; }
.option-check--selected { border-color: #059669; }
.result-stat { display: flex; min-height: 5rem; flex-direction: column; justify-content: center; gap: .35rem; border: 1px solid; border-radius: 1rem; padding: .8rem; text-align: center; }
.result-stat span { font-size: .75rem; font-weight: 700; }
.result-stat strong { font-size: 1.25rem; font-weight: 900; }
.result-stat--score { border-color: #c7d2fe; background: #eef2ff; color: #4338ca; }
.result-stat--correct { border-color: #a7f3d0; background: #ecfdf5; color: #047857; }
.result-stat--wrong { border-color: #fecaca; background: #fef2f2; color: #be123c; }
.result-stat--unanswered { border-color: #fde68a; background: #fffbeb; color: #b45309; }
.result-stat--time { border-color: #bae6fd; background: #f0f9ff; color: #0369a1; }
.answer-review { border: 1px solid; border-radius: 1rem; padding: 1rem 1.2rem; }
.answer-review--correct { border-color: #a7f3d0; background: #f0fdf4; }
.answer-review--wrong { border-color: #fecaca; background: #fff7f7; }
.answer-review--unanswered { border-color: #fde68a; background: #fffbeb; }
.notice-marquee__track { animation: exam-notice-marquee 18s linear infinite; }
.notice-marquee:hover .notice-marquee__track { animation-play-state: paused; }
@keyframes exam-notice-marquee { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
@media (prefers-reduced-motion: reduce) { .notice-marquee__track { animation: none; transform: none; } }
</style>