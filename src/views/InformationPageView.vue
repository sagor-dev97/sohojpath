<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import http from '../api/http'
const route = useRoute()
const { locale } = useI18n()
const page = ref(null), loading = ref(true), error = ref('')
const fallback = {
 about: { bn: ['আমাদের সম্পর্কে', 'শেখা, প্রস্তুতি ও এগিয়ে যাওয়ার সহজ সঙ্গী'], en: ['About us', 'A simple companion for learning and progress'] },
 terms: { bn: ['শর্তাবলি', 'সহজপাঠ ব্যবহারের নিয়ম ও শর্ত'], en: ['Terms and conditions', 'Rules for using SohojPath'] },
 privacy: { bn: ['গোপনীয়তা নীতি', 'আপনার তথ্য কীভাবে ব্যবহার হয়'], en: ['Privacy policy', 'How information is used on SohojPath'] },
}
const slug = computed(() => String(route.name || 'about'))
const lang = computed(() => locale.value === 'en' ? 'en' : 'bn')
const title = computed(() => page.value?.[lang.value]?.title || fallback[slug.value][lang.value][0])
const subtitle = computed(() => page.value?.[lang.value]?.subtitle || fallback[slug.value][lang.value][1])
const body = computed(() => page.value?.[lang.value]?.body || '')
const bn = computed(() => lang.value === 'bn')
async function load() {
 loading.value = true; error.value = ''
 try { page.value = (await http.get('/pages/' + slug.value)).data.data }
 catch (e) { error.value = e.response?.data?.message || (bn.value ? 'এই পেজের তথ্য আনা যায়নি।' : 'Could not load this page.') }
 finally { loading.value = false }
}
onMounted(load)
watch(slug, load)
watch(title, (value) => { document.title = value + ' - SohojPath' }, { immediate: true })
</script>
<template>
 <main class="container-page py-8 md:py-14">
  <section class="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-10 text-white shadow-xl md:px-12 md:py-14">
   <div class="absolute -right-20 -top-28 size-80 rounded-full border border-white/10"></div><div class="absolute -right-4 -top-12 size-56 rounded-full border border-white/10"></div>
   <div class="relative max-w-3xl"><p class="inline-flex rounded-full border border-emerald-200/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100">{{ bn ? 'সহজপাঠ · তথ্য ও নীতিমালা' : 'SOHOJPATH · INFORMATION' }}</p><h1 class="mt-5 text-3xl font-black md:text-5xl">{{ title }}</h1><p class="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/80 md:text-base">{{ subtitle }}</p></div>
  </section>
  <nav class="my-5 flex items-center gap-2 text-sm text-slate-500"><RouterLink to="/" class="hover:text-emerald-700">{{ bn ? 'হোম' : 'Home' }}</RouterLink><span>/</span><span class="font-semibold text-slate-700">{{ title }}</span></nav>
  <div v-if="loading" class="panel p-10 text-center text-slate-500">{{ bn ? 'তথ্য লোড হচ্ছে...' : 'Loading page...' }}</div><div v-else-if="error" class="panel p-8 text-center text-rose-700">{{ error }}</div>
  <article v-else class="panel overflow-hidden border-slate-200/80 shadow-[0_16px_50px_rgba(15,23,42,.06)]">
   <div class="border-b border-slate-100 px-6 py-5 md:px-10"><span class="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">{{ bn ? 'সহজপাঠ সম্পর্কে' : 'ABOUT SOHOJPATH' }}</span></div>
   <div v-if="body" class="legal-content px-6 py-7 md:px-10 md:py-10" v-html="body"></div><div v-else class="px-6 py-12 text-center"><div class="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">i</div><p class="mt-4 font-semibold text-slate-700">{{ bn ? 'এই পেজের লেখা শিগগিরই যোগ করা হবে।' : 'Content for this page will be added soon.' }}</p></div>
   <footer class="border-t border-slate-100 bg-slate-50/70 px-6 py-5 md:px-10"><RouterLink to="/" class="text-sm font-bold text-emerald-800 hover:text-emerald-600">{{ bn ? 'সহজপাঠে ফিরে যান' : 'Back to SohojPath' }} →</RouterLink></footer>
  </article>
 </main>
</template>
<style scoped>
.legal-content :deep(p) { margin: 0 0 1.15rem; color: #475569; line-height: 1.9; }
.legal-content :deep(h2) { margin: 2rem 0 .75rem; color: #0f172a; font-size: 1.25rem; font-weight: 800; }
.legal-content :deep(h3) { margin: 1.5rem 0 .6rem; color: #0f172a; font-size: 1.1rem; font-weight: 750; }
.legal-content :deep(ul), .legal-content :deep(ol) { margin: 0 0 1.2rem; padding-left: 1.5rem; color: #475569; line-height: 1.9; }
.legal-content :deep(a) { color: #047857; text-decoration: underline; text-underline-offset: 3px; }
</style>