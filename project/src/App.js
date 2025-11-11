import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.js';
import MainPage from './pages/MainPage.js';
import SignInPage from './pages/SignInPage.js';
import SignUpPage from './pages/SignUpPage.js';
import SearchPage from './pages/SearchPage.js';
import FavoritesPage from './pages/FavoritesPage.js';
import UserProfilePage from './pages/UserProfilePage.js';
import PricingPage from './pages/PricingPage.js'; // 🚨 PricingPage 임포트 🚨
import useAuthStatus from './hooks/useAuthStatus.js';

function App() {
  const { user, loading } = useAuthStatus();

  // 1. 애플리케이션 초기 로딩 상태 처리 (최상위)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-indigo-600 font-bold">로딩 중...</div>
      </div>
    );
  }

  // 인증이 필요한 라우트 (로그인/가입 후 접근 가능)
  const ProtectedRoute = ({ children }) => {
    
    // 🚨 핵심 수정: 로그인 직후 user 상태가 확정될 때까지 로딩 상태를 한 번 더 체크하고 대기합니다.
    if (loading) {
      // 로딩 중일 때는 아무것도 렌더링하지 않고 대기 (또는 간단한 스피너)
      return <div className="flex items-center justify-center min-h-screen bg-gray-50">인증 상태 확인 중...</div>;
    }
    
    // 로딩이 완료된 후, user가 있으면 children(MainPage)을, 없으면 /signin으로 이동합니다.
    return user ? children : <Navigate to="/signin" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/pricing" element={<PricingPage />} /> {/* 🚨 요금제 라우트 추가 🚨 */}

        {/* 보호된 라우트 */}
        <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

        {/* 기타 라우트 처리 (404 페이지 대신 LandingPage로 리다이렉트) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;