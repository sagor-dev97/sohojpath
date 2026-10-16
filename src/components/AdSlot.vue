<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({ slot: { type: String, default: 'content' }, label: { type: String, default: 'বিজ্ঞাপন' } })
const client = import.meta.env.VITE_ADSENSE_CLIENT
const slotId = props.slot === 'home' ? import.meta.env.VITE_ADSENSE_HOME_SLOT : import.meta.env.VITE_ADSENSE_CONTENT_SLOT
const adElement = ref(null)
const adIsFilled = ref(Boolean(client && slotId))
let observer
let statusTimer

function checkAdStatus() {
  const status = adElement.value?.getAttribute('data-ad-status')
  if (status === 'filled') {
    adIsFilled.value = true
  } else if (status === 'unfilled') {
    adIsFilled.value = false
  }
}

onMounted(() => {
  if (!client || !slotId || !adElement.value) return
  observer = new MutationObserver(checkAdStatus)
  observer.observe(adElement.value, { attributes: true, attributeFilter: ['data-ad-status'] })

  const requestAd = () => {
    try { window.adsbygoogle = window.adsbygoogle || []; window.adsbygoogle.push({}) } catch {}
    checkAdStatus()
    statusTimer = window.setTimeout(() => {
      checkAdStatus()
      if (adElement.value?.getAttribute('data-ad-status') !== 'filled') adIsFilled.value = false
    }, 3000)
  }

  if (document.querySelector('script[data-adsense]')) {
    requestAd()
  } else {
    const script = document.createElement('script')
    script.async = true
    script.dataset.adsense = 'true'
    script.crossOrigin = 'anonymous'
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client)
    script.addEventListener('load', requestAd, { once: true })
    script.addEventListener('error', () => { adIsFilled.value = false }, { once: true })
    document.head.append(script)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.clearTimeout(statusTimer)
})
</script>

<template>
  <div v-if="client && slotId" v-show="adIsFilled" class="my-7 overflow-hidden rounded-2xl border border-slate-200 bg-white text-center">
    <span class="block pt-2 text-[10px] uppercase tracking-[.18em] text-slate-400">{{ label }}</span>
    <ins ref="adElement" class="adsbygoogle block min-h-24" :data-ad-client="client" :data-ad-slot="slotId" data-ad-format="auto" data-full-width-responsive="true"></ins>
  </div>
</template>

