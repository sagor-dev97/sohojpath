import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    language: { name: 'English', choose: 'Choose language', english: 'English', bangla: 'বাংলা' },
    nav: { home: 'Home', recent: 'Recent', quiz: 'GK Quiz', jobs: 'Jobs', about: 'About us', browse: 'Browse jobs', profile: 'Profile' },
    brand: { strapline: 'Learn · Prepare · Succeed', topLine: 'Learn, prepare, and move forward', updates: 'Daily education and job updates', footer: 'Useful information for jobs, admissions, and learning—all in one place.', links: 'Quick links', info: 'Information', rights: 'All rights reserved.' },
    home: { badge: 'A trusted companion for your preparation', hero: 'Find opportunities,', heroLine2: 'move forward', intro: 'Job circulars, admission updates, and daily general knowledge—all the information you need in one place.', seeJobs: 'Browse jobs', practice: 'Practice GK', career: 'CAREER', recentJobs: 'Recent job circulars', allJobs: 'All jobs', jobsLoading: 'Loading job listings…', jobType: 'Job opening', country: 'Bangladesh', deadline: 'Deadline:', notListed: 'Not specified', details: 'View details', noJobs: 'No job circulars yet', noJobsHint: 'New listings will appear here when published.', dailyChallenge: 'DAILY CHALLENGE', playQuiz: 'Take the GK quiz', challengeText: 'Test your knowledge and learn something new.', startQuiz: 'Start quiz', todayQuestion: "Today's question", questionSoon: 'A new question is coming soon.', answer: 'Answer now', loadError: 'Could not load data. Please try again later.' },
    jobs: { eyebrow: 'CAREERS', title: 'Job circulars', intro: 'Find recent job openings and apply on time.', searchPlaceholder: 'Search by title or organization', search: 'Search', loading: 'Loading job listings…', location: 'Bangladesh', salary: 'See circular', deadline: 'Deadline', notSpecified: 'Not specified', details: 'Details and application', empty: 'No job circulars found', emptyHint: 'Try a different search or check back later.', loadError: 'Could not load job listings. Check your API connection.' },
    job: { back: 'All jobs', loading: 'Loading job circular…', type: 'Job opening', location: 'Location', salary: 'Salary', seeCircular: 'See circular', applyDeadline: 'Application deadline', published: 'Published', recent: 'Recent', qualifications: 'Qualifications', seeDetails: 'See circular for details.', description: 'Description', source: 'Source:', original: 'View original circular', apply: 'Apply now', applyHint: 'Review the original circular carefully before applying.', applicationLink: 'Application link', noApplication: 'No application link has been added yet.', notFound: 'This job circular was not found or has been removed.', loadError: 'Could not load this job circular.' },
    quiz: { eyebrow: 'LEARN AND PRACTICE', title: "Today's GK quiz", intro: 'Answer each question to see the correct answer and explanation.', score: 'Your score:', question: 'Question', general: 'General knowledge', check: 'Check answer', correct: 'Correct!', answerIs: 'Correct answer:', explanation: 'Explanation', loading: 'Loading questions…', emptyTitle: 'No questions available yet', empty: 'New questions will appear here when published.', loadError: 'Could not load the quiz. Please try again.', answerError: 'Could not check your answer. Please try again.' },
  },
  bn: {
    difficulty: { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' },
    language: { name: 'বাংলা', choose: 'ভাষা বেছে নিন', english: 'English', bangla: 'বাংলা' },
    nav: { home: 'হোম', recent: 'সাম্প্রতিক', quiz: 'জিকে কুইজ', jobs: 'চাকরি', about: 'আমাদের সম্পর্কে', browse: 'সার্কুলার দেখুন', profile: 'প্রোফাইল' },
    brand: { strapline: 'জানুন · প্রস্তুত হন', topLine: 'শিখুন, প্রস্তুতি নিন, এগিয়ে যান', updates: 'প্রতিদিনের শিক্ষা ও চাকরির আপডেট', footer: 'চাকরি, ভর্তি ও শেখার দরকারি তথ্য সহজে খুঁজে পেতে আপনার পাশে।', links: 'দ্রুত লিংক', info: 'তথ্য', rights: 'সব অধিকার সংরক্ষিত।' },
    home: { badge: 'আপনার প্রস্তুতির নির্ভরযোগ্য সঙ্গী', hero: 'সুযোগ খুঁজুন,', heroLine2: 'এগিয়ে যান', intro: 'চাকরির সার্কুলার, ভর্তি আপডেট আর প্রতিদিনের সাধারণ জ্ঞান—সব দরকারি তথ্য এক জায়গায়।', seeJobs: 'চাকরি দেখুন', practice: 'জিকে অনুশীলন', career: 'ক্যারিয়ার', recentJobs: 'সাম্প্রতিক চাকরি', allJobs: 'সব সার্কুলার', jobsLoading: 'চাকরির তথ্য লোড হচ্ছে…', jobType: 'নিয়োগ বিজ্ঞপ্তি', country: 'বাংলাদেশ', deadline: 'শেষ তারিখ:', notListed: 'উল্লেখ নেই', details: 'বিস্তারিত পড়ুন', noJobs: 'এখনো কোনো সার্কুলার নেই', noJobsHint: 'নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ হলে এখানে দেখা যাবে।', dailyChallenge: 'প্রতিদিনের চ্যালেঞ্জ', playQuiz: 'জিকে কুইজ খেলুন', challengeText: 'নিজের জ্ঞান যাচাই করুন এবং নতুন কিছু শিখুন।', startQuiz: 'কুইজ শুরু করুন', todayQuestion: 'আজকের প্রশ্ন', questionSoon: 'নতুন প্রশ্ন শিগগিরই আসছে।', answer: 'উত্তর দিন', loadError: 'তথ্য আনা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
    jobs: { eyebrow: 'ক্যারিয়ার', title: 'চাকরির সার্কুলার', intro: 'সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি খুঁজুন, সময়মতো আবেদন করুন।', searchPlaceholder: 'পদ বা প্রতিষ্ঠানের নাম লিখুন', search: 'খুঁজুন', loading: 'চাকরির তথ্য লোড হচ্ছে…', location: 'বাংলাদেশ', salary: 'বিজ্ঞপ্তিতে দেখুন', deadline: 'শেষ তারিখ', notSpecified: 'উল্লেখ নেই', details: 'বিস্তারিত ও আবেদন', empty: 'কোনো সার্কুলার পাওয়া যায়নি', emptyHint: 'অন্য শব্দ দিয়ে খুঁজুন অথবা পরে আবার দেখুন।', loadError: 'চাকরির তালিকা আনা যায়নি। API সংযোগ পরীক্ষা করুন।' },
    job: { back: 'সব চাকরি', loading: 'সার্কুলার লোড হচ্ছে…', type: 'নিয়োগ বিজ্ঞপ্তি', location: 'কর্মস্থল', salary: 'বেতন', seeCircular: 'বিজ্ঞপ্তিতে দেখুন', applyDeadline: 'আবেদনের শেষ সময়', published: 'প্রকাশের তারিখ', recent: 'সাম্প্রতিক', qualifications: 'যোগ্যতা', seeDetails: 'বিস্তারিত বিজ্ঞপ্তিতে দেখুন।', description: 'বিস্তারিত', source: 'সূত্র:', original: 'মূল বিজ্ঞপ্তি দেখুন', apply: 'আবেদন করুন', applyHint: 'আবেদনের আগে মূল বিজ্ঞপ্তির শর্তগুলো ভালোভাবে পড়ে নিন।', applicationLink: 'আবেদনের লিংক', noApplication: 'আবেদনের লিংক এখনো যোগ করা হয়নি।', notFound: 'এই সার্কুলারটি পাওয়া যায়নি অথবা সরিয়ে নেওয়া হয়েছে।', loadError: 'সার্কুলারটি লোড করা যায়নি।' },
    quiz: { eyebrow: 'শিখুন ও যাচাই করুন', title: 'আজকের জিকে কুইজ', intro: 'প্রশ্নের উত্তর দিন, সঙ্গে সঙ্গে সঠিক উত্তর ও ব্যাখ্যা জানুন।', score: 'আপনার স্কোর:', question: 'প্রশ্ন', general: 'সাধারণ জ্ঞান', check: 'উত্তর যাচাই', correct: 'সঠিক উত্তর!', answerIs: 'সঠিক উত্তর:', explanation: 'ব্যাখ্যা', loading: 'প্রশ্ন আনা হচ্ছে…', emptyTitle: 'এখন কোনো প্রশ্ন নেই', empty: 'নতুন প্রশ্ন প্রকাশ হলে এখানে কুইজ পাবেন।', loadError: 'কুইজ লোড করা যায়নি। আবার চেষ্টা করুন।', answerError: 'উত্তর যাচাই করা যায়নি। আবার চেষ্টা করুন।' },
  },
}

const savedLanguage = localStorage.getItem('site-language')
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLanguage === 'en' ? 'en' : 'bn',
  fallbackLocale: 'bn',
  messages,
})

export default i18n




