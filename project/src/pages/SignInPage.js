import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
// useAuthStatus에서 auth 인스턴스를 가져오지 않고, firebase.js에서 가져오는 것으로 가정합니다.
// 만약 auth를 useAuthStatus에서 가져온다면 코드를 다시 조정해야 합니다.
import { auth } from '../firebase.js'; 
import { ArrowLeft, Mail, Lock } from 'lucide-react'; // 아이콘 추가


// 🚨🚨🚨 수정: InputField 컴포넌트를 SignInPage 밖으로 분리하여 재렌더링 문제 해결 🚨🚨🚨
const InputField = React.forwardRef(({ id, label, type, value, onChange, placeholder, icon: Icon, name, onKeyDown }, ref) => (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-gray-800 transition duration-150">
        <div className="p-3 text-gray-400">
          <Icon size={20} />
        </div>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          ref={ref} // forwardRef를 통해 전달받은 ref를 input 엘리먼트에 연결
          required
          placeholder={placeholder}
          className="w-full py-3 pr-4 bg-transparent text-gray-800 focus:outline-none placeholder-gray-500"
        />
      </div>
    </div>
  ));
  
  const SignInPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      email: '',
      password: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const emailRef = useRef(null);
  
    // 페이지 로드 시 이메일 필드에 자동 포커스
    React.useEffect(() => {
      if (emailRef.current) {
        emailRef.current.focus();
      }
    }, []);
  
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // 🚨 수정된 부분: 로그인 성공 시 메인 페이지로 이동합니다.
        navigate('/main'); 
        
      } catch (err) {
        console.error("로그인 오류:", err);
        // Firebase 오류 코드를 기반으로 사용자 친화적인 메시지를 설정합니다.
        if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
          setError('유효하지 않은 이메일 주소입니다.');
        } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (err.code === 'auth/too-many-requests') {
            setError('로그인 시도 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.');
        } else {
            setError('로그인 중 알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    return (
      // Tailwind CSS를 사용하여 중앙 정렬되고 모바일 반응형인 레이아웃을 구성합니다.
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl border border-gray-100">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center space-x-2">
                <span className="text-indigo-600">My</span>LinkBox
            </h1>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              계정에 접속하여 링크를 관리하세요.
            </p>
          </div>
  
          {/* Error Message */}
          {error && (
            <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}
  
          {/* Sign In Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <InputField
                id="email"
                name="email"
                label="이메일 주소"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                icon={Mail}
                ref={emailRef} // ref 연결
            />
  
            {/* Password Input */}
            <InputField
                id="password"
                name="password"
                label="비밀번호"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                icon={Lock}
            />
  
            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white transition duration-150 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800'}`
            }
          >
            {loading ? '로그인 중...' : 'Sign In'}
          </button>
        </form>
  
        {/* Forgot Password Link & Sign Up Navigation */}
        <div className="mt-8 text-center border-t pt-6 border-gray-100">
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition duration-150">
            비밀번호를 잊으셨나요? (기능 미구현)
          </a>
          <p className="mt-3 text-sm text-gray-600">
            계정이 없으신가요? 
            <button
              onClick={() => navigate('/signup')}
              className="text-indigo-600 hover:text-indigo-500 font-semibold ml-1 transition duration-150"
            >
              회원가입
            </button>
          </p>
        </div>
  
        {/* Back Button (Figma style) */}
        <div className="flex justify-center mt-8">
            <button 
              onClick={() => navigate('/')} 
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 transition duration-150"
              aria-label="뒤로가기"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
        </div>
        
      </div>
    </div>
    );
  };
  
  export default SignInPage;
