<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import http from '../../api/http'
import AdSlot from '../../components/AdSlot.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const jobs = ref([])
const meta = ref(null)
const loading = ref(false)
const error = ref('')
const search = ref(route.query.search || '')
async function load() {
  loading.value = true; error.value = ''
  try {
    const { data } = await http.get('/jobs', { params: { search: route.query.search, page: route.query.page || 1 } })
    jobs.value = data.data || []; meta.value = data.meta
  } catch { error.value = t('jobs.loadError') }
  finally { loading.value = false }
}
function submitSearch() { router.push({ name: 'jobs', query: search.value ? { search: search.value } : {} }) }
watch(() => route.query, () => load())
onMounted(load)
</script>

<template>
  <div class="container-page py-10 md:py-14">
    <div class="rounded-3xl bg-emerald-950 px-6 py-9 text-white md:px-10"><span class="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">{{ $t('jobs.eyebrow') }}</span><h1 class="mt-2 text-3xl font-extrabold md:text-4xl">{{ $t('jobs.title') }}</h1><p class="mt-2 text-sm text-emerald-100/80">{{ $t('jobs.intro') }}</p></div>
    <AdSlot />
    <div class="my-7 flex flex-col gap-3 sm:flex-row"><input v-model="search" class="field flex-1" :placeholder="$t('jobs.searchPlaceholder')" @keyup.enter="submitSearch"><button class="btn-primary justify-center" @click="submitSearch">{{ $t('jobs.search') }} <span>⌕</span></button></div>
    <p v-if="loading" class="surface p-10 text-center text-slate-500">{{ $t('jobs.loading') }}</p>
    <p v-else-if="error" class="surface p-10 text-center text-rose-600">{{ error }}</p>
    <div v-else-if="jobs.length" class="grid gap-4 lg:grid-cols-2">
      <article v-for="job in jobs" :key="job.id" class="surface p-5">
        <span class="pill">{{ job.employment_type || $t('jobs.title') }}</span><h2 class="mt-3 text-lg font-extrabold text-slate-900">{{ job.title }}</h2><p class="mt-1 text-sm text-slate-500">{{ job.organization }}</p>
        <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600"><span>📍 {{ job.location || $t('jobs.location') }}</span><span>💰 {{ job.salary_text || $t('jobs.salary') }}</span><span>⏳ {{ $t('jobs.deadline') }}</span><b class="text-rose-600">{{ job.deadline || $t('jobs.notSpecified') }}</b></div>
        <RouterLink :to="{ name: 'job', params: { slug: job.slug } }" class="mt-5 inline-flex text-sm font-bold text-emerald-700">{{ $t('jobs.details') }} <span class="ml-2">→</span></RouterLink>
      </article>
    </div>
    <div v-else class="surface p-12 text-center"><div class="text-4xl">🔎</div><h2 class="mt-4 text-xl font-bold">{{ $t('jobs.empty') }}</h2><p class="mt-2 text-sm text-slate-500">{{ $t('jobs.emptyHint') }}</p></div>
    <div v-if="meta && meta.last_page > 1" class="mt-8 flex justify-center gap-2"><button v-for="page in meta.last_page" :key="page" class="rounded-lg border px-4 py-2" :class="page === meta.current_page ? 'border-emerald-700 bg-emerald-700 text-white' : 'bg-white'" @click="router.push({ query: { ...route.query, page } })">{{ page }}</button></div>
  </div>
</template>
