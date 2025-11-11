import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Archive, Share2, ArrowRight } from 'lucide-react';

// 기능 카드 컴포넌트
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <Icon className="w-8 h-8 text-indigo-600 mb-4" />
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const LandingPage = () => {
  return (
    // 배경색을 이미지와 유사한 연한 회색으로 변경 (bg-gray-50)
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header - 상단 고정, 깔끔한 흰색 배경 */}
      <header className="sticky top-0 z-10 flex justify-between items-center p-4 md:px-8 bg-white shadow-md">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-wider">MyLinkBox</h1>
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* 🚨 요금제 페이지 링크를 Link 컴포넌트로 명확하게 설정 🚨 */}
          <Link 
            to="/pricing"
            className="text-gray-600 hover:text-indigo-600 transition duration-150 font-medium hidden sm:block"
          >
            요금제
          </Link>
          <Link 
            to="/signin" 
            className="text-gray-600 hover:text-indigo-600 transition duration-150 font-medium"
          >
            로그인
          </Link>
          <Link 
            to="/signup" 
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
          >
            무료 시작
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-6xl text-center py-20 md:py-32 px-4">
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            당신의 모든 웹 링크를 <span className="text-indigo-600">가장 스마트하게</span> 정리하고 검색하세요.
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            MyLinkBox는 수많은 링크 속에서 길을 잃지 않도록 도와주는 강력한 링크 관리 도구입니다.
          </p>
          <div className="mt-8 flex justify-center items-center space-x-4">
            <Link
                to="/signup"
                className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
                <span>지금 시작하기</span>
                <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
                to="/pricing"
                className="flex items-center space-x-2 px-8 py-3 bg-indigo-500 text-white font-bold rounded-lg shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:translate-y-[-2px] focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
            >
                <span>5분 만에 무료로 시작하세요.</span>
                <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Feature Section - 3개의 카드 섹션 */}
        <section className="w-full max-w-6xl pb-16 md:pb-24 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="빠른 링크 저장"
              description="단 한 번의 클릭 또는 간단한 복사-붙여넣기로 모든 웹 링크를 즉시 저장하고 분류합니다."
            />
            <FeatureCard
              icon={Archive}
              title="깔끔한 정리와 검색"
              description="태그, 폴더, 카테고리 기능을 활용하여 링크를 깔끔하게 정리하고, 강력한 검색 기능으로 원하는 정보를 즉시 찾을 수 있습니다."
            />
            <FeatureCard
              icon={Share2}
              title="안전한 동기화 및 공유"
              description="모든 기기에서 안전하게 링크를 동기화하며, 필요한 경우 친구나 동료와 쉽게 링크를 공유할 수 있습니다."
            />
          </div>
        </section>

        {/* 🚨 고객님이 문의하신 "mylinkbox 프리미어 결제" 섹션 추가 및 경로 연결 🚨 */}
        <section className="w-full bg-indigo-50 py-16 md:py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                    링크 관리를 한 단계 업그레이드하세요.
                </h3>
                <p className="mt-4 text-lg text-gray-700">
                    무제한 저장, 고급 검색 필터, 우선 지원 등의 프리미엄 기능을 만나보세요.
                </p>
                <Link
                    to="/pricing" // 🚨 /pricing 페이지로 정확하게 이동하도록 설정
                    className="inline-flex items-center justify-center space-x-3 mt-8 px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                    <span>MyLinkBox 프리미엄 결제</span>
                    <ArrowRight className="w-6 h-6" />
                </Link>
            </div>
        </section>
        
        {/* Footer */}
        <footer className="w-full bg-gray-900 text-white py-10 mt-auto">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} MyLinkBox. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <Link to="/pricing" className="hover:text-white transition duration-150">요금제</Link>
                    <Link to="/signin" className="hover:text-white transition duration-150">로그인</Link>
                    <Link to="/privacy" className="hover:text-white transition duration-150">개인정보처리방침</Link>
                </div>
            </div>
        </footer>

      </main>
    </div>
  );
};

export default LandingPage;
