import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import PostDetail from './pages/Blog/PostDetail';
import IchingPage from './pages/Iching';
import IntentionPage from './pages/Oracle/IntentionPage';
import TarotPage from './pages/Tarot';
import RunesPage from './pages/Runes';
import LoginPage from './pages/Login/LoginPage';
import GrimorioPage from './pages/Grimorio/GrimorioPage';
import SanctumPage from './pages/Sanctum/SanctumPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<PostDetail />} />
            <Route
              path="oracle"
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<IntentionPage />} />
              <Route path="iching" element={<IchingPage />} />
              <Route path="tarot" element={<TarotPage />} />
              <Route path="runes" element={<RunesPage />} />
            </Route>
            <Route path="login" element={<LoginPage />} />
            <Route
              path="grimorio"
              element={
                <ProtectedRoute>
                  <GrimorioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="sanctum"
              element={
                <ProtectedRoute>
                  <SanctumPage />
                </ProtectedRoute>
              }
            />
            {/* Catch all redirecting to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
