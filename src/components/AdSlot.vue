<script setup>
import { onMounted } from 'vue'

const props = defineProps({ slot: { type: String, default: 'content' }, label: { type: String, default: 'বিজ্ঞাপন' } })
const client = import.meta.env.VITE_ADSENSE_CLIENT
const slotId = props.slot === 'home' ? import.meta.env.VITE_ADSENSE_HOME_SLOT : import.meta.env.VITE_ADSENSE_CONTENT_SLOT

onMounted(() => {
  if (!client || !slotId) return
  if (!document.querySelector('script[data-adsense]')) {
    const script = document.createElement('script')
    script.async = true
    script.dataset.adsense = 'true'
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
    document.head.append(script)
    script.addEventListener('load', () => document.querySelectorAll('.adsbygoogle').forEach(() => window.adsbygoogle?.push({})))
  } else {
    try { window.adsbygoogle?.push({}) } catch {}
  }
})
</script>

<template>
  <div v-if="client && slotId" class="my-7 overflow-hidden rounded-2xl border border-slate-200 bg-white text-center">
    <span class="block pt-2 text-[10px] uppercase tracking-[.18em] text-slate-400">{{ label }}</span>
    <ins class="adsbygoogle block min-h-24" :data-ad-client="client" :data-ad-slot="slotId" data-ad-format="auto" data-full-width-responsive="true"></ins>
  </div>
  <div v-else class="my-7 flex min-h-16 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-xs text-slate-400">বিজ্ঞাপনের জায়গা</div>
</template>
