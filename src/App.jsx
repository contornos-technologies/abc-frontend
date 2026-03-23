import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<div>Signup (em breve)</div>} />
        <Route path="/profile" element={<div>Profile (em breve)</div>} />
        <Route path="/admin" element={<div>Admin (em breve)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
