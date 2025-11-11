import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js'; // firebase.js 파일에서 auth 객체를 임포트합니다.
import { ArrowLeft, UserPlus, Mail, Lock } from 'lucide-react'; 

// 🚨 핵심 수정: InputField 컴포넌트를 SignUpPage 밖으로 이동하여 포커스 문제를 해결합니다.
const InputField = ({ id, label, type, value, onChange, placeholder, icon: Icon, errorState, onKeyDown, autoFocus = false }) => (
  <div className="relative">
    <label htmlFor={id} className="sr-only">{label}</label>
    <div className={`flex items-center border rounded-lg focus-within:ring-2 transition duration-150
      ${errorState 
        ? 'border-red-500 focus-within:ring-red-500' 
        : 'border-gray-300 focus-within:ring-indigo-500' // 회원가입 페이지는 인디고 톤으로 통일
      }`}>
      <div className="p-3 text-gray-400">
        <Icon size={20} />
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        className="w-full py-3 pr-4 bg-transparent text-gray-800 focus:outline-none placeholder-gray-500 text-base"
      />
    </div>
    {errorState && (
      <p className="mt-1 text-sm text-red-600">
        {errorState}
      </p>
    )}
  </div>
);


const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // 입력할 때마다 오류 메시지 초기화
    if (error) {
      setError('');
    }
  };

  const handleAgreementChange = (e) => {
    setAgree(e.target.checked);
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;
    
    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    // 간단한 비밀번호 길이 확인 (Firebase 최소 6자)
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    
    setError(''); // 모든 유효성 검사 통과
    return true;
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm() || !agree) {
        if (!agree && validateForm()) {
             setError('개인정보 처리 방침에 동의해야 합니다.');
        }
        return;
    }

    setLoading(true);
    setError('');

    try {
      // Firebase 이메일 및 비밀번호로 사용자 생성
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 회원가입 성공 후, 메인 페이지로 이동 (useAuthStatus 훅이 자동으로 인증 상태 처리)
      console.log('회원가입 성공:', formData.email);
      navigate('/main');

    } catch (error) {
      console.error('회원가입 오류:', error);
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해 주세요.';

      // Firebase 오류 코드에 따른 메시지 설정
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '이미 사용 중인 이메일 주소입니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '유효하지 않은 이메일 주소 형식입니다.';
          break;
        case 'auth/weak-password':
          errorMessage = '비밀번호는 6자 이상이어야 합니다.';
          break;
        default:
          errorMessage = error.message;
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-4">
      
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <UserPlus className="w-10 h-10 mx-auto text-indigo-600 mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            MyLinkBox에 가입하기
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            링크 관리를 시작해 보세요!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          
          {/* Email Input */}
          <InputField
            id="email"
            name="email"
            label="이메일 주소"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일 주소를 입력하세요"
            icon={Mail}
            errorState={null} // 오류 메시지는 중앙에서 처리
            autoFocus={true}
          />
          
          {/* Password Input */}
          <InputField
            id="password"
            name="password"
            label="비밀번호"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호 (6자 이상)"
            icon={Lock}
            errorState={null}
          />

          {/* Confirm Password Input */}
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label="비밀번호 확인"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            icon={Lock}
            errorState={null}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                    handleSignUp(e);
                }
            }}
          />

          {/* Agreement Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreement"
                name="agreement"
                type="checkbox"
                checked={agree}
                onChange={handleAgreementChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreement" className="font-medium text-gray-700">
                <span className="text-indigo-600 hover:text-indigo-500 cursor-pointer">개인정보 처리 방침</span>에 동의합니다.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !agree}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white transition duration-150
              ${(loading || !agree) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`
            }
          >
            {loading ? '가입 처리 중...' : 'Register'}
          </button>
        </form>

        {/* Sign In Navigation */}
        <div className="mt-8 text-center border-t pt-6 border-gray-100">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요? 
            <button
              onClick={() => navigate('/signin')}
              className="text-indigo-600 hover:text-indigo-500 font-semibold ml-1 transition duration-150"
            >
              로그인
            </button>
          </p>
        </div>

        {/* Back Button (Figma style) */}
        <div className="flex justify-center mt-8">
            <button 
              onClick={() => navigate('/')} 
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 transition duration-150"
              aria-label="메인 페이지로 돌아가기"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
