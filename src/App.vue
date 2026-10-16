<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import http from './api/http'

const menuOpen = ref(false)
const backgroundImage = ref('')
const pageBackgroundStyle = computed(() => backgroundImage.value
  ? {
      backgroundImage: `linear-gradient(rgb(248 250 252 / 88%), rgb(248 250 252 / 88%)), url("${backgroundImage.value}")`,
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }
  : {})

onMounted(async () => {
  try {
    const { data } = await http.get('/site-settings')
    backgroundImage.value = data.background_image_url || ''
  } catch {
    backgroundImage.value = ''
  }
})

function addWaterRipple(event) {
  if (event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ripple = document.createElement('span')
  ripple.className = 'water-ripple'
  ripple.setAttribute('aria-hidden', 'true')
  ripple.style.left = `${event.clientX}px`
  ripple.style.top = `${event.clientY}px`
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  document.body.append(ripple)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800" :style="pageBackgroundStyle" @pointerdown.capture="addWaterRipple">
    <div class="bg-emerald-950 text-emerald-50">
      <div class="container-page flex h-9 items-center justify-between text-xs"><span>{{ $t('brand.topLine') }}</span><span>{{ $t('brand.updates') }}</span></div>
    </div>
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="container-page flex min-h-[76px] items-center justify-between gap-5 py-3">
        <RouterLink to="/" class="flex shrink-0 items-center gap-3" :aria-label="$t('nav.home')">
          <span class="grid size-11 place-items-center rounded-2xl bg-emerald-700 text-xl font-black text-white">স</span>
          <span><b class="block text-xl font-extrabold tracking-tight text-slate-900">সহজপাঠ</b><small class="text-xs text-slate-500">{{ $t('brand.strapline') }}</small></span>
        </RouterLink>
        <button class="rounded-lg border px-3 py-2 md:hidden" :aria-label="$t('nav.home')" @click="menuOpen = !menuOpen">☰</button>
        <nav :class="['absolute inset-x-0 top-full border-b bg-white p-4 shadow-lg md:static md:flex md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none', menuOpen ? 'flex flex-col gap-3' : 'hidden']">
          <RouterLink class="nav-link" to="/" @click="menuOpen=false">{{ $t('nav.home') }}</RouterLink>
          <RouterLink class="nav-link" to="/articles" @click="menuOpen=false">{{ $i18n.locale === 'bn' ? 'সাম্প্রতিক' : 'Recent' }}</RouterLink>
          <RouterLink class="nav-link" to="/gk" @click="menuOpen=false">{{ $t('nav.quiz') }}</RouterLink>
          <RouterLink class="nav-link" to="/jobs" @click="menuOpen=false">{{ $t('nav.jobs') }}</RouterLink>
          <a href="#about" class="nav-link" @click="menuOpen=false">{{ $t('nav.about') }}</a>
          <LanguageSwitcher />
          <RouterLink to="/jobs" class="btn-primary hidden md:inline-flex">{{ $t('nav.browse') }} <span>↗</span></RouterLink>
        </nav>
      </div>
    </header>
    <main><RouterView /></main>
    <footer id="about" class="mt-20 bg-slate-950 text-slate-300">
      <div class="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><b class="text-xl text-white">সহজপাঠ</b><p class="mt-3 max-w-sm text-sm leading-6 text-slate-400">{{ $t('brand.footer') }}</p></div>
        <div><b class="text-sm text-white">{{ $t('brand.links') }}</b><div class="mt-4 grid gap-3 text-sm"><RouterLink to="/articles">{{ $i18n.locale === 'bn' ? 'সাম্প্রতিক খবর' : 'Recent articles' }}</RouterLink><RouterLink to="/gk">{{ $t('nav.quiz') }}</RouterLink><RouterLink to="/jobs">{{ $t('home.recentJobs') }}</RouterLink></div></div>
        <div><b class="text-sm text-white">{{ $t('brand.info') }}</b><p class="mt-4 text-sm text-slate-400">© {{ new Date().getFullYear() }} সহজপাঠ · {{ $t('brand.rights') }}</p></div>
      </div>
    </footer>
  </div>
</template>
