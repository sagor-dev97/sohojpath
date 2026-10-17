<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/http'
import { clearSession } from '../api/auth'

const router = useRouter()
const user = ref(null)
const attempts = ref([])
const examCount = ref(0)
const name = ref('')
const loading = ref(true)
const busy = ref(false)
const message = ref('')
const error = ref('')

async function load() {
  loading.value = true
  try {
    const responses = await Promise.all([http.get('/account/profile'), http.get('/account/attempts')])
    user.value = responses[0].data.user
    name.value = user.value.name
    examCount.value = responses[0].data.exam_count || 0
    attempts.value = responses[1].data.data || []
  } catch {
    clearSession()
    await router.replace({ name: 'account', query: { redirect: '/profile' } })
  } finally {
    loading.value = false
  }
}

function displayScore(score) { const value = Number(score); return Number.isFinite(value) ? value : 0 }

async function updateName() {
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    const { data } = await http.patch('/account/profile', { name: name.value })
    user.value = data.user
    localStorage.setItem('sohojpath_user', JSON.stringify(data.user))
    message.value = 'আপনার নাম আপডেট হয়েছে।'
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'নাম আপডেট করা যায়নি।'
  } finally {
    busy.value = false
  }
}

async function signOut() {
  try { await http.post('/account/logout') } catch {}
  clearSession()
  router.replace('/')
}

onMounted(load)
</script>

<template>
  <main class="container-page min-h-[70vh] py-10">
    <div class="mx-auto max-w-4xl">
      <p v-if="loading" class="surface p-10 text-center">প্রোফাইল লোড হচ্ছে…</p>
      <template v-else-if="user">
        <header class="mb-6 flex flex-wrap items-center justify-between gap-3"><div><span class="eyebrow">আমার অ্যাকাউন্ট</span><h1 class="section-title">{{ user.name }}</h1></div><button class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold" @click="signOut">সাইন আউট</button></header>
        <section class="surface p-6"><h2 class="text-lg font-extrabold">প্রোফাইল</h2><p class="mt-2 text-sm font-semibold text-emerald-800">আপনি মোট {{ examCount }} বার পরীক্ষা দিয়েছেন।</p><p class="mt-1 text-sm text-slate-500">{{ user.email }}</p><form class="mt-4 flex flex-wrap gap-3" @submit.prevent="updateName"><input v-model.trim="name" required maxlength="255" class="field min-w-56 flex-1"><button class="btn-primary" :disabled="busy">{{ busy ? 'সংরক্ষণ…' : 'নাম সংরক্ষণ' }}</button></form><p v-if="message" class="mt-3 text-sm text-emerald-700">{{ message }}</p><p v-if="error" class="mt-3 text-sm text-rose-700">{{ error }}</p></section>
        <section class="mt-7"><h2 class="mb-4 text-xl font-extrabold">আমার সংরক্ষিত পরীক্ষার ফল</h2>
          <div v-if="!attempts.length" class="surface p-8 text-center text-sm text-slate-500">এখনো কোনো পরীক্ষার ফল সংরক্ষণ করেননি।</div>
          <div v-else class="grid gap-4"><article v-for="attempt in attempts" :key="attempt.id" class="surface p-5">
            <div class="flex flex-wrap items-center justify-between gap-3"><div><p class="text-xs text-slate-500">{{ new Date(attempt.submitted_at).toLocaleString() }}</p><p class="mt-1 text-2xl font-black text-emerald-800">{{ displayScore(attempt.result.score) }} / {{ attempt.result.total_marks }}</p></div><div class="text-right text-sm"><p>সঠিক {{ attempt.result.correct_count }} · ভুল {{ attempt.result.wrong_count }}</p><p class="text-xs text-rose-600">কাটা নম্বর {{ attempt.result.wrong_cut_marks }}</p></div></div>
            <div v-if="attempt.result.wrong_answers?.length" class="mt-4 border-t pt-3"><p class="text-sm font-bold">ভুল প্রশ্নের সঠিক উত্তর</p><div v-for="item in attempt.result.wrong_answers" :key="item.number" class="mt-3 text-sm"><p>{{ item.number }}. {{ item.question }}</p><p class="text-rose-700">আপনার উত্তর: {{ item.selected_answer }}</p><p class="font-semibold text-emerald-700">সঠিক উত্তর: {{ item.correct_answer }}</p></div></div>
          </article></div>
        </section>
      </template>
    </div>
  </main>
</template>

