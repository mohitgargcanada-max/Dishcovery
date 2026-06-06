import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'

const Landing = lazy(() => import('./pages/Landing'))
const Feed = lazy(() => import('./pages/Feed'))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'))
const CookMode = lazy(() => import('./pages/CookMode'))
const Generate = lazy(() => import('./pages/Generate'))
const PostRecipe = lazy(() => import('./pages/PostRecipe'))
const Search = lazy(() => import('./pages/Search'))
const Profile = lazy(() => import('./pages/Profile'))
const Saved = lazy(() => import('./pages/Saved'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      gcTime: 2 * 60 * 1000,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
      <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Toast({ toast }) {
  const colors = {
    success: 'bg-[#4CAF7D] text-white',
    error: 'bg-[#FF4444] text-white',
    info: 'bg-[#242424] border border-white/10 text-[#F5F5F0]',
  }
  return (
    <div className={`${colors[toast.type] ?? colors.info} text-sm px-4 py-2.5 rounded-xl shadow-xl`}>
      {toast.message}
    </div>
  )
}

function Toasts() {
  const toasts = useUIStore((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading, profile, isFirstLogin } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/" replace />
  if (profile && isFirstLogin()) return <Navigate to="/onboarding" replace />
  return children
}

function AppLayout({ children }) {
  const { user } = useAuthStore()
  const location = useLocation()
  const isCookMode = location.pathname.includes('/cook')

  if (!user || isCookMode) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />
      <Sidebar />
      <main className="lg:pl-56 pt-14 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
          <Route path="/recipe/:id/cook" element={<ProtectedRoute><CookMode /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
          <Route path="/post" element={<ProtectedRoute><PostRecipe /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  useEffect(() => { initialize() }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toasts />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
