import { createRouter, createWebHistory } from 'vue-router'
import http from '../api/http'
import HomeView from '../views/HomeView.vue'
import JobsView from '../views/jobs/JobsView.vue'
import JobView from '../views/jobs/JobView.vue'
import GkView from '../views/gk/GkView.vue'
import ArticlesView from '../views/articles/ArticlesView.vue'
import ArticleView from '../views/articles/ArticleView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'সহজপাঠ — শিক্ষা ও চাকরির আপডেট', description: 'চাকরি, শিক্ষা ও সাধারণ জ্ঞানের নির্ভরযোগ্য আপডেট এক জায়গায়।' } },
    { path: '/jobs', name: 'jobs', component: JobsView, meta: { title: 'চাকরির সার্কুলার — সহজপাঠ', description: 'সাম্প্রতিক চাকরির নিয়োগ বিজ্ঞপ্তি, যোগ্যতা ও আবেদনের তথ্য খুঁজুন।' } },
    { path: '/jobs/:slug', name: 'job', component: JobView, meta: { title: 'চাকরির বিস্তারিত — সহজপাঠ', description: 'চাকরির বিজ্ঞপ্তি, যোগ্যতা, শেষ সময় ও আবেদন লিংক দেখুন।' } },
    { path: '/gk', name: 'gk', component: GkView, meta: { title: 'দৈনিক সাধারণ জ্ঞান কুইজ — সহজপাঠ', description: 'প্রতিদিনের জিকে কুইজে অংশ নিন এবং নিজের প্রস্তুতি যাচাই করুন।' } },
    { path: '/articles', name: 'articles', component: ArticlesView, meta: { title: 'সাম্প্রতিক খবর — সহজপাঠ', description: 'সাম্প্রতিক ঘটনা ও খবর পড়ুন।' } },
    { path: '/articles/:slug', name: 'article', component: ArticleView, meta: { title: 'সাম্প্রতিক খবর — সহজপাঠ', description: 'সাম্প্রতিক ঘটনার বিস্তারিত পড়ুন।' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title || 'সহজপাঠ'
  const description = document.querySelector('meta[name="description"]')
  if (description) description.content = to.meta.description || 'চাকরি, শিক্ষা ও সাধারণ জ্ঞানের নির্ভরযোগ্য আপডেট।'

  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = `${window.location.origin}${to.path}`

  const analyticsId = import.meta.env.VITE_GA4_ID
  if (analyticsId) {
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
    if (!document.querySelector('script[data-ga4]')) {
      const script = document.createElement('script')
      script.async = true
      script.dataset.ga4 = 'true'
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`
      document.head.append(script)
      window.gtag('js', new Date())
      window.gtag('config', analyticsId, { send_page_view: false })
    }
    window.gtag('event', 'page_view', { page_path: to.fullPath, page_title: document.title })
  }

  http.post('/tracking/hit', { path: to.path }).catch(() => {})
})

export default router
