/* eslint-disable no-undef */ 
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";
// getFirestore와 setLogLevel을 함께 import합니다.
import { getFirestore, setLogLevel } from "firebase/firestore";

// Firestore 로깅 활성화 (개발 환경 디버깅용)
setLogLevel('debug');

// Canvas 환경에서 제공되는 전역 변수 로드.
// appId를 export하여 다른 파일(예: UserProfilePage.js)에서 import할 수 있도록 합니다.
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { 
    apiKey: "AIzaSyDakf8NlDFSZG5GwU0TU313sjBD1YmGXms",
    authDomain: "github-b1de8.firebaseapp.com",
    projectId: "github-b1de8",
    storageBucket: "github-b1de8.firebasestorage.app",
    messagingSenderId: "318134431183",
    appId: "1:318134431183:web:9eba901255025573bc36ba",
    measurementId: "G-FPC2S6P78N"
    };

// 오타 수정: __initialAuthToken -> __initial_auth_token
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 1. Firebase App 초기화
const app = initializeApp(firebaseConfig, appId);

// 2. Firebase Auth 및 Firestore 인스턴스
export const auth = getAuth(app);
// db는 이미 export되고 있었습니다.
export const db = getFirestore(app);


/**
 * Firebase 인증을 초기화하고 사용자를 로그인시키는 핵심 함수입니다.
 */
export const initializeAuth = async () => {
  try {
    if (initialAuthToken) {
      console.log(`[Firebase Init] Custom Token으로 로그인 시도: ${initialAuthToken.substring(0, 10)}...`);
      await signInWithCustomToken(auth, initialAuthToken);
      console.log(`[Firebase Init] Custom Token 로그인 성공. User ID: ${auth.currentUser?.uid}`);
    } else {
      console.log("[Firebase Init] Custom Token 없음. 익명 로그인 시도.");
      await signInAnonymously(auth);
      console.log(`[Firebase Init] 익명 로그인 성공. User ID: ${auth.currentUser?.uid}`);
    }
    
  } catch (error) {
    console.error("[Firebase Init] 인증 초기화 중 오류 발생:", error.code, error.message);
  }
};

export default app;
