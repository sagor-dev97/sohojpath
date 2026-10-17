<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import http from '../../api/http'
import AdSlot from '../../components/AdSlot.vue'

const { t } = useI18n()
const questions = ref([])
const answers = ref({})
const results = ref({})
const loading = ref(true)
const error = ref('')
const score = computed(() => Object.values(results.value).filter((result) => result.correct).length)
function optionClass(question, key) {
  const result = results.value[question.id]
  if (result?.correct_option === key) return 'border-emerald-500 bg-emerald-50 text-emerald-900'
  if (result && answers.value[question.id] === key) return 'border-rose-500 bg-rose-50 text-rose-900'
  if (!result && answers.value[question.id] === key) return 'border-emerald-600 bg-emerald-50'
  return 'border-slate-200 hover:border-emerald-300'
}
async function load() {
  try { const { data } = await http.get('/gk/quizzes/daily'); questions.value = data.data || [] }
  catch { error.value = t('quiz.loadError') }
  finally { loading.value = false }
}
async function answer(question) {
  if (!answers.value[question.id] || results.value[question.id]) return
  try {
    const { data } = await http.post(`/gk/questions/${question.id}/answer`, { option: answers.value[question.id] })
    results.value[question.id] = data
  } catch { error.value = t('quiz.answerError') }
}
onMounted(load)
</script>

<template>
  <div class="container-page py-10 md:py-14">
    <section class="rounded-3xl bg-amber-50 px-6 py-9 md:px-10"><span class="text-xs font-bold uppercase tracking-[.2em] text-amber-700">{{ $t('quiz.eyebrow') }}</span><h1 class="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">{{ $t('quiz.title') }}</h1><p class="mt-2 text-sm text-slate-600">{{ $t('quiz.intro') }}</p><p v-if="questions.length && Object.keys(results).length" class="mt-4 font-bold text-emerald-800">{{ $t('quiz.score') }} {{ score }}/{{ questions.length }}</p></section>
    <div class="mt-5 flex justify-end"><RouterLink to="/gk/exam-categories" class="btn-primary">পূর্ণাঙ্গ MCQ পরীক্ষা দিন <span>→</span></RouterLink></div>
    <AdSlot />
    <p v-if="loading" class="surface p-10 text-center">{{ $t('quiz.loading') }}</p><p v-else-if="error && !questions.length" class="surface p-10 text-center text-rose-600">{{ error }}</p>
    <div v-else-if="questions.length" class="mx-auto grid max-w-3xl gap-5">
      <article v-for="(question, index) in questions" :key="question.id" class="surface p-5 md:p-7"><div class="flex justify-between gap-4"><span class="pill">{{ $t('quiz.question') }} {{ index + 1 }}</span><span class="text-xs text-slate-500">{{ question.topic || $t('quiz.general') }} Â· {{ $t('difficulty.' + question.difficulty) }}</span></div><h2 class="mt-4 text-lg font-extrabold leading-7 text-slate-900">{{ question.question }}</h2><div class="mt-4 grid gap-2 sm:grid-cols-2"><label v-for="key in ['a','b','c','d']" :key="key" class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition" :class="optionClass(question, key)"><input v-model="answers[question.id]" type="radio" :name="`q-${question.id}`" :value="key" :disabled="!!results[question.id]" class="accent-emerald-700"><span>{{ question[`option_${key}`] }}</span></label></div><button v-if="!results[question.id]" class="btn-primary mt-4" :disabled="!answers[question.id]" @click="answer(question)">{{ $t('quiz.check') }} <span>â†’</span></button><div v-else class="mt-4 grid gap-3"><div class="rounded-xl border p-4 text-sm" :class="results[question.id].correct ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'"><b>{{ results[question.id].correct ? $t('quiz.correct') : `${$t('quiz.answerIs')} ${results[question.id].correct_option.toUpperCase()}` }}</b></div><div v-if="results[question.id].explanation" class="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700"><span class="mb-1 block text-xs font-bold uppercase tracking-wide text-sky-800">{{ $t('quiz.explanation') }}</span>{{ results[question.id].explanation }}</div></div></article>
    </div>
    <div v-else class="surface p-10 text-center"><h2 class="font-bold">{{ $t('quiz.emptyTitle') }}</h2><p class="mt-2 text-sm text-slate-500">{{ $t('quiz.empty') }}</p></div>
  </div>
</template>




