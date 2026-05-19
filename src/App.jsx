import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import CustomerApp from './pages/CustomerApp'
import DriverApp from './pages/DriverApp'
import AdminDashboard from './pages/AdminDashboard'
import AuthPage from './pages/AuthPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})

// Map role → default view
const roleView = { customer: 'customer', driver: 'driver', admin: 'admin' }

function AppContent() {
  const [activeView, setActiveView] = useState('landing')
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()

  // When user logs in, jump to their role's view
  useEffect(() => {
    if (user) {
      setActiveView(roleView[user.role] || 'landing')
      setShowAuth(false)
    }
  }, [user])

  const handleAuthSuccess = (loggedInUser) => {
    setActiveView(roleView[loggedInUser.role] || 'landing')
    setShowAuth(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-medical-bg dark:bg-medical-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (showAuth) {
    return <AuthPage onSuccess={handleAuthSuccess} />
  }

  const renderView = () => {
    switch (activeView) {
      case 'customer': return <CustomerApp />
      case 'driver':   return <DriverApp />
      case 'admin':
        // Only render admin if logged in as admin, otherwise show auth
        if (!user || user.role !== 'admin') {
          setShowAuth(true)
          return null
        }
        return <AdminDashboard />
      default:         return <LandingPage setActiveView={setActiveView} setShowAuth={setShowAuth} />
    }
  }

  return (
    <div className="min-h-screen bg-medical-bg dark:bg-medical-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        setShowAuth={setShowAuth}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {renderView()}
        </motion.main>
      </AnimatePresence>
      {activeView === 'landing' && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
