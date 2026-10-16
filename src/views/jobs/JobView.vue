<script setup>
import { onMounted, ref, watch, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import http from '../../api/http'
import AdSlot from '../../components/AdSlot.vue'

const { t } = useI18n()
const route = useRoute()
const job = ref(null)
const loading = ref(true)
const error = ref('')
async function load() {
  loading.value = true; error.value = ''
  try { const { data } = await http.get(`/jobs/${encodeURIComponent(route.params.slug)}`); job.value = data.data || data }
  catch { error.value = t('job.notFound') }
  finally { loading.value = false }
}
watchEffect(() => { document.title = job.value ? `${job.value.title} — SohojPath` : `${t('nav.jobs')} — SohojPath` })
onMounted(load)
watch(() => route.params.slug, load)
</script>

<template>
  <div class="container-page py-10">
    <RouterLink to="/jobs" class="text-sm font-semibold text-emerald-700">← {{ $t('job.back') }}</RouterLink>
    <p v-if="loading" class="surface mt-6 p-10 text-center">{{ $t('job.loading') }}</p>
    <div v-else-if="error" class="surface mt-6 p-10 text-center text-slate-600">{{ error }}</div>
    <article v-else-if="job" class="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div class="surface p-6 md:p-9"><span class="pill">{{ job.employment_type || $t('job.type') }}</span><h1 class="mt-4 text-3xl font-extrabold text-slate-950">{{ job.title }}</h1><p class="mt-2 text-lg text-slate-500">{{ job.organization }}</p>
        <div class="my-7 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2"><div><small class="text-slate-500">{{ $t('job.location') }}</small><p class="font-bold">{{ job.location || $t('job.seeCircular') }}</p></div><div><small class="text-slate-500">{{ $t('job.salary') }}</small><p class="font-bold">{{ job.salary_text || $t('job.seeCircular') }}</p></div><div><small class="text-slate-500">{{ $t('job.applyDeadline') }}</small><p class="font-bold text-rose-600">{{ job.deadline || $t('job.seeCircular') }}</p></div><div><small class="text-slate-500">{{ $t('job.published') }}</small><p class="font-bold">{{ job.published_at || $t('job.recent') }}</p></div></div>
        <h2 class="text-xl font-extrabold">{{ $t('job.qualifications') }}</h2><p class="mt-2 whitespace-pre-line leading-7 text-slate-600">{{ job.qualification || $t('job.seeDetails') }}</p><AdSlot /><h2 class="mt-8 text-xl font-extrabold">{{ $t('job.description') }}</h2><div class="prose mt-3 max-w-none whitespace-pre-line leading-7 text-slate-700">{{ job.description }}</div>
        <p v-if="job.source_name || job.source_url" class="mt-8 border-t pt-5 text-sm text-slate-500">{{ $t('job.source') }} <a v-if="job.source_url" :href="job.source_url" target="_blank" rel="noopener noreferrer" class="text-emerald-700 underline">{{ job.source_name || $t('job.original') }}</a><span v-else>{{ job.source_name }}</span></p>
      </div>
      <aside class="surface h-fit p-6"><h2 class="text-lg font-extrabold">{{ $t('job.apply') }}</h2><p class="mt-2 text-sm leading-6 text-slate-500">{{ $t('job.applyHint') }}</p><a v-if="job.application_url" :href="job.application_url" target="_blank" rel="noopener noreferrer" class="btn-primary mt-5 w-full justify-center">{{ $t('job.applicationLink') }} <span>↗</span></a><p v-else class="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{{ $t('job.noApplication') }}</p></aside>
    </article>
  </div>
</template>

