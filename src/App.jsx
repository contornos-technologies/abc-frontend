import CookieBanner from './components/public/CookieBanner'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import ScrollToTop from './components/layout/ScrollToTop'
import AdminLayout from './components/layout/AdminLayout'
import { usePageTracking } from './hooks/usePageTracking'

// Fallback simples enquanto o chunk carrega
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8FC]">
      <div className="w-8 h-8 border-4 border-[#1565A8] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Auth
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'))

// Student
const Profile = lazy(() => import('./pages/student/Profile'))
const EnrollmentCreate = lazy(() => import('./pages/student/EnrollmentCreate'))
const EnrollmentSuccess = lazy(
  () => import('./pages/student/EnrollmentSuccess')
)

// Admin
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Students = lazy(() => import('./pages/admin/Students'))
const StudentDetail = lazy(() => import('./pages/admin/StudentDetail'))
const PaymentsManagement = lazy(
  () => import('./pages/admin/PaymentsManagement')
)
const Cards = lazy(() => import('./pages/admin/Cards'))
const Notifications = lazy(() => import('./pages/admin/Notifications'))
const ExamsList = lazy(() => import('./pages/admin/ExamsList'))
const ExamCreate = lazy(() => import('./pages/admin/ExamCreate'))
const ExamDetail = lazy(() => import('./pages/admin/ExamDetail'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const AdminTestemunhos = lazy(() => import('./pages/admin/AdminTestemunhos'))
const ContactMessages = lazy(() => import('./pages/admin/ContactMessages'))
const EquipaPage = lazy(() => import('./pages/admin/EquipaPage'))
const AdminWhatsApp = lazy(() => import('./pages/admin/AdminWhatsApp'))

// Public
const Home = lazy(() => import('./pages/public/Home'))
const About = lazy(() => import('./pages/public/About'))
const Contact = lazy(() => import('./pages/public/Contact'))
const Privacy = lazy(() => import('./pages/public/Privacy'))
const Terms = lazy(() => import('./pages/public/Terms'))

// Simulation
const SimulationsList = lazy(() => import('./pages/simulation/SimulationsList'))
const SimulationIntro = lazy(() => import('./pages/simulation/SimulationIntro'))
const SimulationPage = lazy(() => import('./pages/simulation/SimulationPage'))
const ResultsPage = lazy(() => import('./pages/simulation/ResultsPage'))

function AppRoutes() {
  const { isSuperAdmin } = useAuth()
  usePageTracking()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/portal/acesso" element={<AdminLogin />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<div>Serviços (em breve)</div>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/simulations" element={<SimulationsList />} />
        <Route path="/simulation/:id" element={<SimulationIntro />} />
        <Route path="/simulation/:id/exam" element={<SimulationPage />} />
        <Route path="/simulation/:id/results" element={<ResultsPage />} />

        {/* ESTUDANTE */}
        <Route
          path="/student/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/enrollment/new"
          element={
            <PrivateRoute>
              <EnrollmentCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/enrollment/success"
          element={
            <PrivateRoute>
              <EnrollmentSuccess />
            </PrivateRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="payments" element={<PaymentsManagement />} />
          <Route path="cards" element={<Cards />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="exams" element={<ExamsList />} />
          <Route path="exams/new" element={<ExamCreate />} />
          <Route path="exams/:id" element={<ExamDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="testimonials" element={<AdminTestemunhos />} />
          <Route path="contact-messages" element={<ContactMessages />} />
          <Route path="whatsapp" element={<AdminWhatsApp />} />
          <Route
            path="team"
            element={
              isSuperAdmin ? <EquipaPage /> : <Navigate to="/admin" replace />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
