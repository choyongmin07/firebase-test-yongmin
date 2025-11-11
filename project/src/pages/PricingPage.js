import React, { useState } from 'react';
import { Check, Zap, DollarSign, Calendar, Link as LinkIcon, ArrowRight } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom'; // Link와 useNavigate 임포트
import SharedLayout from '../components/SharedLayout'; 

// ==========================================================
// 🚨 유틸리티 함수 및 데이터 🚨
// ==========================================================

// 요금제 데이터
const pricingPlans = [
  {
    title: "Basic (무료)",
    monthly: 0,
    yearly: 0,
    link: 100,
    features: [
      "최대 100개의 링크 저장",
      "기본 태그 및 검색",
      "모바일/데스크탑 동기화",
      "광고 포함",
      "이메일 지원 (느림)"
    ],
    theme: 'light',
  },
  {
    title: "Pro (월간 인기)",
    monthly: 9000,
    yearly: 90000,
    link: 5000,
    features: [
      "최대 5,000개의 링크 저장",
      "고급 필터 및 카테고리",
      "광고 없음",
      "프리미엄 검색 기능",
      "우선 이메일 지원",
      "공유 링크 비활성화"
    ],
    theme: 'dark',
  },
  {
    title: "Enterprise",
    monthly: '문의',
    yearly: '문의',
    link: '무제한',
    features: [
      "무제한 링크 저장",
      "맞춤형 기능 및 통합",
      "전담 계정 관리",
      "실시간 우선 지원",
      "맞춤형 보안 및 규정 준수",
      "온프레미스 설치 지원"
    ],
    theme: 'dark-special',
  },
];

// ==========================================================
// 🚨 컴포넌트 🚨
// ==========================================================

// 피처 리스트 아이템 컴포넌트
const FeatureItem = ({ children }) => (
    <li className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
        <Check className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <span className="text-sm">{children}</span>
    </li>
);

// 요금제 카드 컴포넌트
const PricingCard = ({ title, price, period, features, theme, onClick, isCurrent }) => {
    
    // 테마 설정
    const isDark = theme === 'dark' || theme === 'dark-special';
    const isSpecial = theme === 'dark-special';
    const bgColor = isSpecial ? 'bg-indigo-600' : isDark ? 'bg-gray-800' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const subTextColor = isDark ? 'text-indigo-200' : 'text-gray-500';
    const borderColor = isSpecial ? 'border-indigo-700' : isDark ? 'border-gray-700' : 'border-gray-200';
    const buttonBg = isSpecial ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-500 text-white hover:bg-indigo-600';

    return (
        <div className={`flex flex-col p-8 rounded-2xl shadow-2xl border ${borderColor} ${bgColor} ${textColor} transform transition duration-500 hover:scale-[1.02] ${isSpecial ? 'ring-4 ring-indigo-500' : ''}`}>
            {isSpecial && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 px-4 py-1 bg-amber-400 text-gray-900 text-xs font-bold uppercase rounded-full shadow-lg transform rotate-6">
                    최고의 선택
                </div>
            )}
            
            <h3 className={`text-2xl font-extrabold ${isSpecial ? 'text-white' : ''}`}>{title}</h3>
            {isCurrent && (
                <p className="mt-1 text-xs font-semibold text-green-400 dark:text-green-300">
                    현재 사용 중
                </p>
            )}

            {/* 가격 */}
            <div className="mt-4 flex items-baseline">
                {typeof price === 'number' ? (
                    <>
                        <span className={`text-5xl font-extrabold ${isSpecial ? 'text-white' : ''}`}>
                            {price.toLocaleString('ko-KR')}
                        </span>
                        <span className={`ml-2 text-xl font-medium ${subTextColor}`}>원</span>
                    </>
                ) : (
                    <span className={`text-4xl font-extrabold ${isSpecial ? 'text-white' : ''}`}>{price}</span>
                )}
                {period && period !== 'Link' && (
                    <span className={`ml-2 text-md font-medium ${subTextColor}`}>/ {period}</span>
                )}
            </div>
            <p className={`mt-1 text-sm ${subTextColor} min-h-[20px]`}>
                {period === 'Yearly' && '월 7,500원 절약 효과!'}
                {period === 'Link' && '일회성 링크 수량 제한'}
            </p>

            {/* 버튼: 여기서 onClick을 사용합니다. */}
            <button
                onClick={onClick}
                disabled={isCurrent}
                className={`w-full mt-6 py-3 px-4 rounded-lg text-lg font-bold shadow-md transition duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-opacity-50 ${buttonBg} ${isCurrent ? 'bg-gray-400 text-gray-700 hover:bg-gray-400 cursor-not-allowed' : ''}`}
            >
                {title === 'Basic (무료)' 
                    ? (isCurrent ? '사용 중' : '지금 시작하기')
                    : '프리미엄 시작하기'
                }
                <ArrowRight className="w-5 h-5 ml-2 inline-block" />
            </button>


            {/* 기능 리스트 */}
            <div className={`mt-8 space-y-4 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-base font-semibold text-indigo-400">포함된 기능</h4>
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <FeatureItem key={i}>{feature}</FeatureItem>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// ==========================================================
// 🚨 메인 페이지 컴포넌트 🚨
// ==========================================================

const PricingPage = () => {
    const [cycle, setCycle] = useState('Monthly'); // 'Monthly', 'Yearly', 'Link'
    const navigate = useNavigate(); // useNavigate 훅 사용

    // 링크 수량제 선택을 위한 임시 변환
    const cycleType = cycle === 'Link' ? 'Link' : cycle === 'Monthly' ? 'Monthly' : 'Yearly';

    // 요금제 가격을 선택된 주기에 맞춰 변환
    const plansWithPrice = pricingPlans.map(plan => {
        const priceValue = plan[cycleType.toLowerCase()];
        const periodText = cycleType === 'Monthly' ? '월' : cycleType === 'Yearly' ? '년' : '링크당';

        return {
            ...plan,
            price: priceValue,
            period: periodText
        };
    });

    // 시작하기 버튼 클릭 핸들러 (회원가입 페이지로 이동)
    const handleStartClick = (planTitle) => {
        console.log(`[${planTitle}] 플랜을 통해 회원가입 페이지로 이동합니다. (TODO: 선택 플랜 정보 저장)`);
        // 사용자가 요청한 대로 /signup 페이지로 이동합니다.
        navigate('/signup');
    };


    return (
        <SharedLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                        나에게 맞는 플랜을 선택하세요.
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        MyLinkBox는 다양한 사용자 니즈에 맞는 유연한 요금제를 제공합니다.
                    </p>
                </div>

                {/* Cycle Switcher */}
                <div className="mt-10 flex justify-center space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl max-w-sm mx-auto shadow-inner">
                    {['Monthly', 'Yearly', 'Link'].map((cycleName) => {
                        const isSelected = cycle === cycleName;
                        const Icon = cycleName === 'Monthly' ? Calendar : cycleName === 'Yearly' ? DollarSign : LinkIcon;
                        
                        return (
                            <button
                                key={cycleName}
                                onClick={() => setCycle(cycleName)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition duration-300 ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{cycleName === 'Link' ? '링크 수량제' : cycleName === 'Monthly' ? '월간 결제' : '연간 (2개월 할인!)'}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto mt-12">
                    {plansWithPrice.map((plan, index) => {
                        return (
                            <PricingCard 
                                key={index} 
                                title={plan.title}
                                price={plan.price}
                                period={plan.period}
                                features={plan.features}
                                theme={plan.theme}
                                // 🚨 수정된 부분: 이제 /signup 페이지로 이동합니다. 🚨
                                onClick={() => handleStartClick(plan.title)}
                                isCurrent={plan.title === 'Basic (무료)'} // 예시: 현재 Basic 사용 중 가정
                            />
                        );
                    })}
                </div>
                
                {/* 추가 정보 */}
                <div className="mt-16 text-center text-sm text-gray-500 max-w-3xl mx-auto">
                    <p>
                        모든 유료 플랜은 14일 환불 보증을 제공합니다. 언제든지 플랜을 취소하거나 다운그레이드할 수 있습니다.
                    </p>
                    <p className="mt-2">
                        궁금한 점이 있으시면 고객 지원팀에 문의해 주세요.
                    </p>
                    <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium transition duration-150">
                        메인 페이지로 돌아가기 &rarr;
                    </Link>
                </div>
            </div>
        </SharedLayout>
    );
};

export default PricingPage;
