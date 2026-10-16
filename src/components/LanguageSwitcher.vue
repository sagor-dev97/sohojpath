<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const open = ref(false)
function choose(language) {
  locale.value = language
  localStorage.setItem('site-language', language)
  document.documentElement.lang = language
  open.value = false
}
watch(locale, (language) => { document.documentElement.lang = language }, { immediate: true })
</script>

<template>
  <div class="language-switcher" @keydown.esc="open = false">
    <button class="language-trigger" type="button" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
      <span>{{ locale === 'bn' ? 'বাংলা' : 'English' }}</span>
      <svg class="language-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg>
    </button>
    <div v-if="open" class="language-menu" role="menu" :aria-label="$t('language.choose')">
      <button type="button" role="menuitemradio" :aria-checked="locale === 'bn'" :class="{ selected: locale === 'bn' }" @click="choose('bn')"><span>বাংলা</span><span v-if="locale === 'bn'" class="language-check">✓</span></button>
      <button type="button" role="menuitemradio" :aria-checked="locale === 'en'" :class="{ selected: locale === 'en' }" @click="choose('en')"><span>English</span><span v-if="locale === 'en'" class="language-check">✓</span></button>
    </div>
  </div>
</template>
