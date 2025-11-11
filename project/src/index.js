import React from 'react';
import ReactDOM from 'react-dom/client'; 
import App from './App';
import './index.css';

// 🚨 1. [추가] firebase.js에서 initializeAuth 함수를 가져옵니다.
import { initializeAuth } from './firebase.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 🚨 2. [수정] 앱을 렌더링하기 전에
//          Firebase 초기 인증(익명 또는 커스텀 토큰)을 먼저 실행합니다.
console.log("[App Init] Firebase 인증 초기화를 시작합니다...");
initializeAuth().then(() => {
  // 3. 인증이 완료되면 콘솔에 로그를 남깁니다.
  console.log("[App Init] Firebase 인증 완료. 앱을 렌더링합니다.");
  
  // 4. 인증이 완료된 후 앱을 렌더링합니다.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch(error => {
    console.error("[App Init] 앱 시작 중 심각한 오류 발생:", error);
    // (필요시 오류 UI 렌더링)
});