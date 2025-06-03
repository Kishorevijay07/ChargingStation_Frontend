import './App.css';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ChargerPage from './components/ChargerPage.jsx';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '../urls/constant.js';
import { AuthContext } from './context/AuthContext';

function App() {
  const location = useLocation();

  const {
    data: authUser,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data?.error) return null;
      return data;
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,    // Always fresh
    cacheTime: 0,    // Don't delay removal of old auth state
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <AuthContext.Provider value={authUser}>
      <Routes key={authUser ? 'auth' : 'guest'}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/chargers" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/chargers" />} />
        <Route path="/chargers" element={authUser ? <ChargerPage /> : <Navigate to="/login" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
