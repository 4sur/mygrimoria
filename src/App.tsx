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
import SanctumPage from './pages/Sanctum/SanctumPage';
import ProfilePage from './pages/Profile/ProfilePage';
import TokensPage from './pages/Tokens';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { OracleProvider } from './context/OracleIntentContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <OracleProvider>
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
                path="sanctum"
                element={
                  <ProtectedRoute>
                    <SanctumPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tokens"
                element={
                  <ProtectedRoute>
                    <TokensPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </OracleProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
