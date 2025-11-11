import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

// 🚨 1. [수정] '../firebase.js'에서 실제 auth 인스턴스를 가져옵니다.
// (useAuthStatus.js는 src/hooks/에 있으므로 경로는 '../firebase.js'입니다.)
import { auth as authInstance } from '../firebase.js';

// 🚨 2. [제거] 이 파일의 모든 Firebase 초기화 로직 (firebaseConfig, initializeApp 등)을 제거했습니다.
// 🚨 3. [제거] 이 파일에서 db, appId를 export 하던 코드를 제거했습니다.
//         이제부터 모든 컴포넌트는 'firebase.js'에서 직접 db, appId를 가져가야 합니다.


/**
 * 사용자 인증 상태를 확인하고 로딩 상태를 관리하는 커스텀 React Hook입니다.
 * (초기화 로직이 제거되고 순수 리스너 훅으로 변경됨)
 */
const useAuthStatus = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 1. 항상 로딩 상태로 시작

  useEffect(() => {
    if (!authInstance) {
      console.error("Firebase Auth 인스턴스를 찾을 수 없습니다. (from useAuthStatus)");
      setLoading(false);
      return;
    }

    // 2. onAuthStateChanged 리스너가 인증 상태를 감지합니다.
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser); // 사용자가 있든(currentUser) 없든(null) 상태를 설정합니다.
      setLoading(false);    // 상태가 확정되었으므로 로딩을 종료합니다.
    });

    // 3. 🚨 [제거] 훅 내부의 모든 초기 인증(signInWithCustomToken 등) 로직을 제거했습니다.
    //    이 로직은 이제 index.js에서 호출하는 initializeAuth()가 담당합니다.

    // 컴포넌트 언마운트 시 리스너 해제
    return () => unsubscribe();
  }, []); // 의존성 배열을 비워 마운트 시 한 번만 실행되도록 합니다.

  return { user, loading };
};

export default useAuthStatus;