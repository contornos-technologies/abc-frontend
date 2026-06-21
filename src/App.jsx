import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/layout/PrivateRoute'
import ScrollToTop from './components/layout/ScrollToTop' 

// Layouts
import AdminLayout from './components/layout/AdminLayout'

// Auth
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Student
import Profile from './pages/student/Profile'
import EnrollmentCreate from './pages/student/EnrollmentCreate'
import EnrollmentSuccess from './pages/student/EnrollmentSuccess'

// Admin
import AdminLogin from './pages/auth/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import StudentDetail from './pages/admin/StudentDetail'
import PaymentsManagement from './pages/admin/PaymentsManagement'
import Cards from './pages/admin/Cards'
import Notifications from './pages/admin/Notifications'
import ExamsList from './pages/admin/ExamsList'
import ExamCreate from './pages/admin/ExamCreate'
import ExamDetail from './pages/admin/ExamDetail'
import Analytics from './pages/admin/Analytics'
import AdminTestemunhos from './pages/admin/AdminTestemunhos'
import ContactMessages from './pages/admin/ContactMessages'
import EquipaPage from './pages/admin/EquipaPage'

// Publics
import Home from './pages/public/Home'
import Contact from './pages/public/Contact'
import Privacy from './pages/public/Privacy'
import Terms from './pages/public/Terms'
import About from './pages/public/About'

// Simulation
import SimulationPage from './pages/simulation/SimulationPage'
import ResultsPage from './pages/simulation/ResultsPage'
import SimulationsList from './pages/simulation/SimulationsList'
import SimulationIntro from './pages/simulation/SimulationIntro'

function AppRoutes() {
  const { isSuperAdmin } = useAuth()

  return (
    <Routes>
      {/* ──────────────── */}
      {/* PÚBLICAS         */}
      {/* ──────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
      {/* ──────────────── */}
      {/* ESTUDANTE        */}
      {/* ──────────────── */}
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
      {/* ──────────────── */}
      {/* ADMIN            */}
      {/* ──────────────── */}
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
        <Route
          path="team"
          element={
            isSuperAdmin ? <EquipaPage /> : <Navigate to="/admin" replace />
          }
        />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
