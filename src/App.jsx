import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/student/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<div>Home (em breve)</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<div>About (em breve)</div>} />
          <Route path="/courses" element={<div>Courses (em breve)</div>} />
          <Route path="/contact" element={<div>Contact (em breve)</div>} />

          {/* Estudante — requer login */}
          <Route path="/profile" element={
            <PrivateRoute><Profile/></PrivateRoute>
          } />
          <Route path="/enrollment" element={
            <PrivateRoute><div>Enrollment (em breve)</div></PrivateRoute>
          } />
          <Route path="/payments" element={
            <PrivateRoute><div>Payments (em breve)</div></PrivateRoute>
          } />

          {/* Admin — requer login + role ADMIN */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly><div>Admin (em breve)</div></PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute adminOnly><div>Admin Students (em breve)</div></PrivateRoute>
          } />
          <Route path="/admin/payments" element={
            <PrivateRoute adminOnly><div>Admin Payments (em breve)</div></PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
