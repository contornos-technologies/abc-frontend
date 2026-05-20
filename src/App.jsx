import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Student
import Profile from './pages/student/Profile';
import EnrollmentCreate from './pages/student/EnrollmentCreate';
import EnrollmentSuccess from './pages/student/EnrollmentSuccess';

// Admin
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import PaymentsManagement from './pages/admin/PaymentsManagement';
import Cards from './pages/admin/Cards';
import Notifications from './pages/admin/Notifications';
import Exams from './pages/admin/Exams';
import ExamDetail from './pages/admin/ExamDetail';
import Analytics from './pages/admin/Analytics';

// Publics
import Home from './pages/public/Home';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ──────────────── */}
          {/* PÚBLICAS         */}
          {/* ──────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/portal/acesso" element={<AdminLogin />} />
          <Route path="/" element={<Home />} />
          <Route path="/about"   element={<div>About (em breve)</div>} />
          <Route path="/servicos" element={<div>Serviços (em breve)</div>} />
          <Route path="/contact" element={<div>Contact (em breve)</div>} />

          {/* ──────────────── */}
          {/* ESTUDANTE        */}
          {/* ──────────────── */}
          <Route path="/student/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/student/enrollment/new" element={
            <PrivateRoute>
              <EnrollmentCreate />
            </PrivateRoute>
          } />

          <Route path="/student/enrollment/success" element={
            <PrivateRoute>
              <EnrollmentSuccess />
            </PrivateRoute>
          } />

          {/* ──────────────── */}
          {/* ADMIN            */}
          {/* ──────────────── */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="cards" element={<Cards />} />    
            <Route path="notifications" element={<Notifications />} /> 
            <Route path="exams" element={<Exams />} />
            <Route path="exams/:id" element={<ExamDetail />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
