import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth/AuthPage';
import IntroPage from './pages/Intro/IntroPage';
import AppShell from './components/AppShell';

function LoadingScreen() {
  return <div className="app-loading"><span className="loader-mark">S</span><span>Loading SPYRIX INVOICE</span></div>;
}

export default function App() {
  const { session, checking } = useAuth();
  if (checking) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public landing page always opens first. Intro CTAs lead to login, and only a successful
          login/registration leads to the protected workspace. */}
      <Route path="/" element={<IntroPage />} />
      <Route path="/intro" element={<IntroPage />} />
      <Route path="/login" element={session ? <Navigate to="/app/dashboard" replace /> : <AuthPage />} />
      <Route path="/register" element={session ? <Navigate to="/app/dashboard" replace /> : <AuthPage initialMode="register" />} />
      <Route path="/app/*" element={session ? <AppShell /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
