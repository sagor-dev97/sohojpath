<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../api/http'
import { saveSession } from '../api/auth'

const route = useRoute()
const router = useRouter()
const signup = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmation = ref('')
const busy = ref(false)
const error = ref('')
const googleButton = ref(null)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const returnPath = computed(() => {
  const path = typeof route.query.redirect === 'string' ? route.query.redirect : '/profile'
  return path.startsWith('/') && !path.startsWith('//') ? path : '/profile'
})

function finish(data) {
  saveSession(data)
  router.replace(returnPath.value)
}

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const endpoint = signup.value ? '/account/register' : '/account/login'
    const payload = signup.value
      ? { name: name.value, email: email.value, password: password.value, password_confirmation: confirmation.value }
      : { email: email.value, password: password.value }
    const { data } = await http.post(endpoint, payload)
    finish(data)
  } catch (requestError) {
    error.value = requestError.response?.data?.message || Object.values(requestError.response?.data?.errors || {}).flat()[0] || 'অ্যাকাউন্টে প্রবেশ করা যায়নি।'
  } finally {
    busy.value = false
  }
}

async function signInWithGoogle(credential) {
  busy.value = true
  error.value = ''
  try {
    const { data } = await http.post('/account/google', { credential })
    finish(data)
  } catch (requestError) {
    error.value = requestError.response?.data?.message || 'Google দিয়ে প্রবেশ করা যায়নি।'
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  if (!googleClientId || !googleButton.value) return
  const render = () => {
    if (!window.google?.accounts?.id) return
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: (response) => signInWithGoogle(response.credential) })
    window.google.accounts.id.renderButton(googleButton.value, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 320 })
  }
  if (window.google?.accounts?.id) {
    render()
  } else {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = render
    script.onerror = () => { error.value = 'Google sign-in লোড করা যায়নি।' }
    document.head.append(script)
  }
})
</script>

<template>
  <main class="container-page grid min-h-[70vh] place-items-center py-10">
    <section class="surface w-full max-w-lg p-6 md:p-9">
      <RouterLink to="/" class="flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-800"><span class="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white">স</span> সহজপাঠ</RouterLink>
      <h1 class="mt-6 text-center text-2xl font-extrabold text-slate-950">{{ signup ? 'নতুন অ্যাকাউন্ট খুলুন' : 'আপনার অ্যাকাউন্টে প্রবেশ করুন' }}</h1>
      <p class="mt-2 text-center text-sm text-slate-500">পরীক্ষার ফলাফল সংরক্ষণ ও পরে দেখার জন্য সাইন ইন করুন।</p>
      <form class="mt-6 grid gap-4" @submit.prevent="submit">
        <label v-if="signup" class="grid gap-1.5 text-sm font-semibold text-slate-700">আপনার নাম<input v-model.trim="name" required maxlength="255" autocomplete="name" class="field"></label>
        <label class="grid gap-1.5 text-sm font-semibold text-slate-700">ইমেইল<input v-model.trim="email" required type="email" autocomplete="email" class="field"></label>
        <label class="grid gap-1.5 text-sm font-semibold text-slate-700">পাসওয়ার্ড<input v-model="password" required type="password" minlength="8" :autocomplete="signup ? 'new-password' : 'current-password'" class="field"></label>
        <label v-if="signup" class="grid gap-1.5 text-sm font-semibold text-slate-700">পাসওয়ার্ড আবার লিখুন<input v-model="confirmation" required type="password" minlength="8" autocomplete="new-password" class="field"></label>
        <p v-if="error" class="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{{ error }}</p>
        <button class="btn-primary justify-center" :disabled="busy">{{ busy ? 'অপেক্ষা করুন…' : signup ? 'অ্যাকাউন্ট তৈরি করুন' : 'সাইন ইন' }}</button>
      </form>
      <div class="my-5 flex items-center gap-3 text-xs text-slate-400"><span class="h-px flex-1 bg-slate-200"></span>অথবা Google দিয়ে<span class="h-px flex-1 bg-slate-200"></span></div>
      <div ref="googleButton" class="flex min-h-10 justify-center"></div>
      <p v-if="!googleClientId" class="mt-2 text-center text-xs text-slate-400">Google signup চালু করতে Google Client ID configure করতে হবে।</p>
      <button class="mt-5 w-full text-center text-sm font-semibold text-emerald-700" @click="signup = !signup; error = ''">{{ signup ? 'আগে থেকেই অ্যাকাউন্ট আছে? সাইন ইন করুন' : 'অ্যাকাউন্ট নেই? সাইন আপ করুন' }}</button>
    </section>
  </main>
</template>
