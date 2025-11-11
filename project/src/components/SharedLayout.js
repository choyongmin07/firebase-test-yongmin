import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Star } from 'lucide-react'; // Star 아이콘 추가

const SharedLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 전역 검색어 상태 관리 (헤더 검색창 전용)
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');

    // **핵심 수정: 검색 로직 함수로 통합**
    const executeGlobalSearch = () => {
        if (globalSearchQuery.trim() !== '') {
            navigate(`/search?q=${globalSearchQuery.trim()}`);
        }
    };

    // Enter 키를 눌렀을 때 실행
    const handleGlobalSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            executeGlobalSearch();
        }
    };
    
    // URL의 'q' 쿼리 파라미터가 변경될 때마다 전역 검색창의 값을 동기화합니다.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') || '';
        
        // SearchPage에 있을 때나, 다른 페이지에서 검색창을 비우고 홈으로 돌아왔을 때 상태 업데이트
        if (location.pathname === '/search' || q === '') {
             setGlobalSearchQuery(q);
        }
        
    }, [location.pathname, location.search]);
    
    const handleGlobalSearchChange = (e) => {
        setGlobalSearchQuery(e.target.value);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header (상단 고정) */}
            <header className="sticky top-0 z-10 bg-white shadow-md border-b border-gray-100">
                {/* 헤더 컨테이너: 최대 너비 설정 및 중앙 정렬 */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between p-4 md:px-8">
                    
                    {/* Logo and Navigation Buttons */}
                    <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
                        {/* Logo/Home Button */}
                        <button onClick={() => navigate('/main')} className="text-2xl font-extrabold text-indigo-600 tracking-wide hover:text-indigo-700 transition duration-150">
                            MyLinkBox
                        </button>

                        {/* Navigation Links for Mobile/Desktop */}
                        <div className="flex items-center space-x-2 md:space-x-4 ml-4">
                            {/* 즐겨찾기 버튼 추가 */}
                            <button 
                                onClick={() => navigate('/favorites')} 
                                className={`p-2 rounded-full transition ${location.pathname === '/favorites' ? 'bg-yellow-100 text-yellow-600 shadow-inner' : 'hover:bg-gray-100 text-gray-700'}`}
                                aria-label="즐겨찾기 페이지로 이동"
                            >
                                {/* 즐겨찾기 페이지에 있을 때만 별 아이콘을 채웁니다. */}
                                <Star className="w-6 h-6" fill={location.pathname === '/favorites' ? 'currentColor' : 'none'} />
                            </button>
                            
                            {/* 프로필 버튼 */}
                            <button 
                                onClick={() => navigate('/profile')} 
                                className={`p-2 rounded-full transition ${location.pathname === '/profile' ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'hover:bg-gray-100 text-gray-700'}`}
                                aria-label="사용자 프로필 페이지로 이동"
                            >
                                <User className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Global Search Bar */}
                    <div className="w-full max-w-lg md:max-w-md relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="search"
                            value={globalSearchQuery}
                            onChange={handleGlobalSearchChange} 
                            onKeyDown={handleGlobalSearchKeyDown} // Enter 시 전역 검색
                            placeholder="전체 링크에서 검색..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        {/* 검색 버튼 추가: 아이콘 클릭 시 검색 실행 */}
                        <button 
                            onClick={executeGlobalSearch}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full h-full text-gray-400 hover:text-indigo-600 transition"
                            aria-label="전역 검색 실행"
                        >
                            <Search className="h-5 w-5 mr-3" />
                        </button>
                    </div>
                </div>

            </header>

            {/* Main Content */}
            {/* 이 부분이 중앙 정렬의 핵심입니다: max-w-7xl (최대 너비) 와 mx-auto (좌우 자동 마진) 적용 */}
            <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8">
                {children}
            </main>
        </div>
    );
};

export default SharedLayout;