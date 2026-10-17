<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http from '../../api/http'
const route = useRoute()
const category = ref(null), paper = ref(null), questions = ref([]), loading = ref(true), error = ref('')
function formatNumber(index) {
  const number = String(index + 1)
  return paper.value?.numbering_style === 'bangla' ? number.replace(/[0-9]/g, (digit) => String.fromCodePoint(0x09e6 + Number(digit))) : number
}
onMounted(async () => {
  try {
    const { data } = await http.get('/gk/exam-papers/' + encodeURIComponent(route.params.paperId) + '/preview')
    category.value = data.category; paper.value = data.paper; questions.value = data.questions || []
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'This exam preview is unavailable.'
  } finally { loading.value = false }
})
</script>
<template>
  <main class="container-page py-8"><div class="mx-auto max-w-5xl">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><RouterLink :to="category?.slug ? '/gk/exam-categories/' + category.slug : '/gk/exam-categories'" class="text-sm font-semibold text-emerald-800">? Back to exams</RouterLink><RouterLink v-if="paper" class="btn-primary" :to="'/gk/exam-paper/' + route.params.paperId">Start exam</RouterLink></div>
    <p v-if="loading" class="surface p-10 text-center text-slate-500">Loading exam preview...</p><p v-else-if="error" class="surface p-8 text-center text-rose-700">{{ error }}</p>
    <section v-else-if="paper" class="panel relative mx-auto w-full max-w-5xl overflow-hidden p-7 md:p-12">
      <span v-if="paper.watermark" class="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden text-6xl font-black text-slate-200/40" style="transform: rotate(-30deg)">{{ paper.watermark }}</span>
      <header class="relative mb-7 border-b pb-4 text-center"><p>{{ category?.name }}</p><h1 class="text-2xl font-black">{{ paper.title }}</h1><p>Duration: {{ paper.duration_minutes }} minutes | Questions: {{ questions.length }}</p></header>
      <div class="relative grid gap-5" :class="[2, 5].includes(Number(paper.layout_template)) ? 'md:grid-cols-2' : 'grid-cols-1'">
        <article v-for="(question, index) in questions" :key="question.id" class="break-inside-avoid text-sm"><b>Question {{ formatNumber(index) }}. {{ question.question }}</b><div class="mt-2 grid grid-cols-2 gap-1"><span v-for="key in ['a', 'b', 'c', 'd']" :key="key">{{ paper.option_style === 'alphabet' ? key.toUpperCase() + ')' : '' }}<span v-if="paper.option_style !== 'alphabet'">&#9675;</span> {{ question['option_' + key] }}</span></div></article>
      </div>
    </section>
  </div></main>
</template>
