import { createRouter, createWebHistory } from 'vue-router'
import http from '../api/http'
import HomeView from '../views/HomeView.vue'
import JobsView from '../views/jobs/JobsView.vue'
import JobView from '../views/jobs/JobView.vue'
import GkView from '../views/gk/GkView.vue'
import ArticlesView from '../views/articles/ArticlesView.vue'
import ArticleView from '../views/articles/ArticleView.vue'
import ExamView from '../views/gk/ExamView.vue'
import AccountView from '../views/AccountView.vue'
import ProfileView from '../views/ProfileView.vue'
import InformationPageView from '../views/InformationPageView.vue'

const visitorIdKey = 'sohojpath_visitor_id'
let visitorId = localStorage.getItem(visitorIdKey)
if (!visitorId) {
  visitorId = crypto.randomUUID()
  localStorage.setItem(visitorIdKey, visitorId)
}
let activePath = window.location.pathname
function sendPresence() {
  if (document.visibilityState !== 'hidden') {
    http.post('/tracking/presence', { visitor_id: visitorId, path: activePath }).catch(() => {})
  }
}
setInterval(sendPresence, 30000)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') sendPresence()
})

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'SohojPath - Education and Job Updates', description: 'Education, jobs and general knowledge updates in one place.' } },
    { path: '/jobs', name: 'jobs', component: JobsView, meta: { title: 'Job Circulars - SohojPath', description: 'Find recent job openings and application details in Bangladesh.' } },
    { path: '/jobs/:slug', name: 'job', component: JobView, meta: { title: 'Job Details - SohojPath', description: 'Job circular details, qualifications and application information.' } },
    { path: '/gk/exam', name: 'gk-exam', component: ExamView, meta: { title: 'MCQ Exam' } },
    { path: '/gk/exam-categories', name: 'gk-exam-categories', component: () => import('../views/gk/ExamCatalogView.vue'), meta: { title: 'Exam Categories - SohojPath', description: 'Browse published MCQ exam categories.' } },
    { path: '/gk/exam-categories/:slug', name: 'gk-exam-category', component: () => import('../views/gk/ExamCatalogView.vue'), meta: { title: 'Published Exams - SohojPath', description: 'Choose a published exam and test your knowledge.' } },
    { path: '/gk/exam-paper/:paperId', name: 'gk-exam-paper', component: () => import('../views/gk/ExamPaperView.vue'), meta: { title: 'MCQ Exam' } },
    { path: '/account', name: 'account', component: AccountView, meta: { title: 'Account' } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { title: 'Profile' } },
    { path: '/about', name: 'about', component: InformationPageView, meta: { title: 'About us' } },
    { path: '/terms', name: 'terms', component: InformationPageView, meta: { title: 'Terms and conditions' } },
    { path: '/privacy', name: 'privacy', component: InformationPageView, meta: { title: 'Privacy policy' } },
    { path: '/gk', name: 'gk', component: GkView, meta: { title: 'Daily Quiz - SohojPath', description: 'Take a daily quiz and check your preparation.' } },
    { path: '/articles', name: 'articles', component: ArticlesView, meta: { title: 'Recent News - SohojPath', description: 'Read recent events, news and updates.' } },
    { path: '/articles/:slug', name: 'article', component: ArticleView, meta: { title: 'Recent News - SohojPath', description: 'Read the full details of this recent news article.' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  activePath = to.path
  document.title = to.meta.title || 'SohojPath - Education and Job Updates'
  const description = document.querySelector('meta[name="description"]')
  if (description) description.content = to.meta.description || 'Education, jobs and general knowledge updates in one place.'

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
  sendPresence()
})

export default router
