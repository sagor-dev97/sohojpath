<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../../api/http'
import { getAccessToken } from '../../api/auth'
import AdSlot from '../../components/AdSlot.vue'

const route = useRoute()
const router = useRouter()
const sessionKey = 'sohojpath_active_exam'
const attemptToken = ref('')
const questions = ref([])
const answers = ref({})
const result = ref(null)
const expiresAt = ref(0)
const now = ref(Date.now())
const loading = ref(true)
const submitting = ref(false)
const saving = ref(false)
const saved = ref(false)
const previousAttemptCount = ref(0)
const error = ref('')
const answerSyncError = ref(false)
let timerId
let answerSaveQueue = Promise.resolve()

const secondsLeft = computed(() => Math.max(0, Math.ceil((expiresAt.value - now.value) / 1000)))
const clockLabel = computed(() => String(Math.floor(secondsLeft.value / 60)).padStart(2, '0') + ':' + String(secondsLeft.value % 60).padStart(2, '0'))
const answeredCount = computed(() => Object.keys(answers.value).length)

function leaveExam() {
  sessionStorage.removeItem(sessionKey)
  router.push('/gk')
}

function cacheExam() {
  sessionStorage.setItem(sessionKey, JSON.stringify({ token: attemptToken.value, answers: answers.value, result: result.value, saved: saved.value, previousAttemptCount: previousAttemptCount.value }))
}

async function loadExam() {
  loading.value = true
  error.value = ''
  try {
    const cached = JSON.parse(sessionStorage.getItem(sessionKey) || 'null')
    if (cached && cached.token) {
      attemptToken.value = cached.token
      const { data } = await http.get('/gk/exams/' + encodeURIComponent(cached.token))
      questions.value = data.questions
      answers.value = data.answers || cached.answers || {}
      result.value = data.result || cached.result || null
      saved.value = data.saved || cached.saved || false
      expiresAt.value = new Date(data.expires_at).getTime()
    } else {
      const { data } = await http.post('/gk/exams')
      attemptToken.value = data.exam_token
      questions.value = data.questions
      expiresAt.value = new Date(data.expires_at).getTime()
      answers.value = {}
      cacheExam()
    }

    if (getAccessToken()) {
      try {
        const profile = await http.get('/account/profile')
        previousAttemptCount.value = profile.data.exam_count || 0
      } catch {
      }
    }

    if (!result.value && expiresAt.value <= Date.now()) {
      await submitExam(true)
    }
    if (result.value && route.query.save === '1' && getAccessToken() && !saved.value) {
      await saveRecord()
    }
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'পরীক্ষা লোড করা যায়নি। আবার চেষ্টা করুন।'
  } finally {
    loading.value = false
  }
}

function selectAnswer(questionId, option) {
  if (result.value || submitting.value || secondsLeft.value <= 0) return
  answers.value = { ...answers.value, [questionId]: option }
  cacheExam()
  const answerSnapshot = { ...answers.value }
  answerSaveQueue = answerSaveQueue.catch(() => {}).then(async () => {
    await http.put('/gk/exams/' + encodeURIComponent(attemptToken.value) + '/answers', { answers: answerSnapshot })
    answerSyncError.value = false
  }).catch(() => {
    answerSyncError.value = true
  })
}

async function submitExam(isAutomatic = false) {
  if (submitting.value || result.value || !attemptToken.value) return
  submitting.value = true
  error.value = ''
  try {
    await answerSaveQueue.catch(() => {})
    const payload = isAutomatic ? { answers: {} } : { answers: answers.value }
    const { data } = await http.post('/gk/exams/' + encodeURIComponent(attemptToken.value) + '/submit', payload)
    result.value = data.result
    saved.value = data.saved
    cacheExam()
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'ফলাফল জমা হয়নি। আবার চেষ্টা করুন।'
  } finally {
    submitting.value = false
  }
}

async function saveRecord() {
  if (!getAccessToken()) {
    cacheExam()
    await router.push({ name: 'account', query: { redirect: '/gk/exam?save=1' } })
    return
  }
  saving.value = true
  error.value = ''
  try {
    await http.post('/gk/exams/' + encodeURIComponent(attemptToken.value) + '/save')
    saved.value = true
    cacheExam()
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'রেকর্ড সংরক্ষণ করা যায়নি।'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadExam()
  timerId = window.setInterval(() => {
    now.value = Date.now()
    if (!loading.value && !result.value && secondsLeft.value <= 0) submitExam(true)
  }, 500)
})
onBeforeUnmount(() => window.clearInterval(timerId))
</script>

<template>
  <main class="container-page py-8 md:py-12">
    <div class="mx-auto max-w-4xl">
      <header class="mb-6 grid grid-cols-3 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <RouterLink to="/" class="flex items-center gap-2 font-extrabold text-emerald-800"><span class="grid size-10 place-items-center rounded-xl bg-emerald-700 text-lg text-white">স</span><span class="hidden sm:inline">সহজপাঠ</span></RouterLink>
        <h1 class="text-center text-lg font-extrabold text-slate-900 md:text-2xl">MCQ Exam</h1>
        <div class="text-right text-xs font-semibold text-slate-500">১০টি প্রশ্ন</div>
      </header>

      <div v-if="loading" class="surface p-12 text-center">পরীক্ষা প্রস্তুত হচ্ছে…</div>
      <div v-else-if="error && !questions.length" class="surface p-8 text-center"><p class="font-bold text-rose-700">{{ error }}</p><RouterLink to="/gk" class="btn-primary mt-5">ফিরে যান</RouterLink></div>

      <template v-else-if="result">
        <section class="surface mb-6 overflow-hidden">
          <div class="bg-emerald-950 px-6 py-6 text-center text-white"><span class="text-xs font-bold uppercase tracking-widest text-emerald-200">পরীক্ষার ফলাফল</span><p class="mt-2 text-5xl font-black">{{ result.score }}</p><p class="mt-1 text-sm text-emerald-100">১০ নম্বরের মধ্যে মোট স্কোর</p></div>
          <div class="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
            <div class="p-4 text-center"><b class="block text-2xl text-emerald-700">{{ result.correct_count }}</b><span class="text-xs text-slate-500">সঠিক</span></div>
            <div class="p-4 text-center"><b class="block text-2xl text-rose-600">{{ result.wrong_count }}</b><span class="text-xs text-slate-500">ভুল</span></div>
            <div class="p-4 text-center"><b class="block text-2xl text-rose-600">−{{ result.wrong_cut_marks }}</b><span class="text-xs text-slate-500">কাটা নম্বর</span></div>
            <div class="p-4 text-center"><b class="block text-2xl text-slate-700">{{ result.unanswered_count }}</b><span class="text-xs text-slate-500">উত্তর দেননি</span></div>
          </div>
        </section>
        <section v-if="result.wrong_answers.length" class="grid gap-4">
          <h2 class="text-xl font-extrabold text-slate-900">ভুল উত্তর ও সঠিক উত্তর</h2>
          <article v-for="item in result.wrong_answers" :key="item.number" class="surface p-5"><span class="pill">প্রশ্ন {{ item.number }}</span><h3 class="mt-3 font-bold leading-7 text-slate-900">{{ item.question }}</h3><p class="mt-3 text-sm text-rose-700">আপনার উত্তর: {{ item.selected_answer }}</p><p class="mt-1 text-sm font-bold text-emerald-700">সঠিক উত্তর: {{ item.correct_answer }}</p><p v-if="item.explanation" class="mt-2 text-sm leading-6 text-slate-600">{{ item.explanation }}</p></article>
        </section>
        <p v-else class="surface p-6 text-center font-bold text-emerald-800">দারুণ! কোনো ভুল উত্তর নেই।</p>
        <AdSlot label="বিজ্ঞাপন" />
        <p v-if="error" class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-3"><button v-if="!saved" class="btn-primary" :disabled="saving" @click="saveRecord">{{ saving ? 'সংরক্ষণ হচ্ছে…' : 'Save this record' }}</button><RouterLink v-else to="/profile" class="btn-primary">আমার সংরক্ষিত ফলাফল</RouterLink><RouterLink to="/gk" class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700">কুইজে ফিরুন</RouterLink></div>
      </template>

      <template v-else>
        <p v-if="previousAttemptCount > 0" class="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">আপনি আগে {{ previousAttemptCount }} বার পরীক্ষা দিয়েছেন। আবার স্মৃতি যাচাই করতে চেষ্টা করুন!</p>
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-950 px-5 py-4 text-white"><div><span class="text-xs text-emerald-200">মোট প্রশ্ন</span><p class="font-extrabold">১০ · প্রতি প্রশ্ন ১ নম্বর</p><p class="text-xs text-rose-200">প্রতি ভুল উত্তরে ১ নম্বর কাটা হবে</p></div><div class="rounded-xl px-4 py-2 text-center" :class="secondsLeft <= 20 ? 'bg-rose-600' : 'bg-white/10'"><span class="block text-[10px] uppercase tracking-wider text-emerald-100">সময় বাকি</span><b class="font-mono text-2xl">{{ clockLabel }}</b></div></div>
        <div class="mb-5 flex items-center justify-between text-sm text-slate-500"><span>{{ answeredCount }}/১০ উত্তর দিয়েছেন</span><span>সময় শেষ হলে নিজে থেকেই জমা হবে</span></div>
        <p v-if="answerSyncError" class="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">উত্তর সেভ হচ্ছে না—ইন্টারনেট সংযোগ দেখুন।</p>
        <div class="grid gap-4">
          <article v-for="(question, index) in questions" :key="question.id" class="surface p-5 md:p-6">
            <div class="flex items-start justify-between gap-3"><span class="pill">প্রশ্ন {{ index + 1 }} / ১০</span><span class="text-xs text-slate-500">{{ question.topic || 'সাধারণ জ্ঞান' }}</span></div>
            <h2 class="mt-4 text-base font-extrabold leading-7 text-slate-900 md:text-lg">{{ question.question }}</h2>
            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              <label v-for="key in ['a', 'b', 'c', 'd']" :key="key" class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition" :class="answers[question.id] === key ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'"><input type="radio" :name="'exam-' + question.id" :checked="answers[question.id] === key" class="accent-emerald-700" @change="selectAnswer(question.id, key)"><span>{{ question['option_' + key] }}</span></label>
            </div>
          </article>
        </div>
        <p v-if="error" class="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
        <div class="mt-6 flex flex-wrap justify-center gap-3"><button class="btn-primary" :disabled="submitting" @click="submitExam(false)">{{ submitting ? 'জমা হচ্ছে…' : 'Submit exam' }}</button><button class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700" @click="leaveExam">বাতিল করে ফিরুন</button></div>
      </template>
    </div>
  </main>
</template>


