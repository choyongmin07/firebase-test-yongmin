import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
// 🚨 수정: firebase.js에서 내보낸 'initializeAuth' 함수를 사용합니다.
import { auth, initializeAuth } from './firebase.js'; 

// 1. 컨텍스트 객체 생성
const AuthContext = createContext();

// 2. 이 컨텍스트를 쉽게 사용할 수 있는 Hook 생성
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
  }
  return context;
};

// 3. Provider 컴포넌트 생성 (앱 전체를 감싸서 인증 상태를 제공)
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authListenerUnsubscribe;

    const setupAuth = async () => {
      // 🚨 핵심 수정: firebase.js에서 export 한 initializeAuth() 호출
      // 이 로직은 AuthContext가 처음 마운트될 때 단 한 번만 실행됩니다.
      if (auth && loading) {
          await initializeAuth();
      }

      // Firebase의 인증 상태 변화 감지 리스너를 설정합니다.
      // initialAuth가 완료된 후 currentUser 상태를 최종적으로 업데이트합니다.
      authListenerUnsubscribe = onAuthStateChanged(auth, (user) => {
        // user 객체가 있으면 로그인 상태, null이면 로그아웃 상태
        setCurrentUser(user); 
        setLoading(false); // 로딩 끝
      });
    };

    if (auth) {
        setupAuth();
    } else {
        // auth 인스턴스가 없는 경우 (Firebase 초기화 실패 등)
        setLoading(false);
    }
    

    // 컴포넌트가 언마운트될 때 리스너 해제 (메모리 누수 방지)
    return () => {
        if (authListenerUnsubscribe) {
            authListenerUnsubscribe();
        }
    };
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  // AuthContext를 통해 제공할 값
  const value = {
    currentUser,
    // 로그인 여부를 쉽게 확인할 수 있도록 isLoggedIn 속성 추가
    isLoggedIn: !!currentUser, 
    loading,
    auth, 
  };

  // 로딩 중에는 로딩 화면을 표시하고, 완료 후에는 children을 렌더링합니다.
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-xl text-indigo-600 font-bold">인증 로딩 중...</div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};