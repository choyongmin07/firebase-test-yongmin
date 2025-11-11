import React, { useState, useMemo } from 'react';
import SharedLayout from '../components/SharedLayout.js';
import AddLinkModal from '../components/AddLinkModal.js';
// 사용자 설정 관련 아이콘 및 기능 임포트가 모두 제거됨.
import { Plus, Link, Zap, LayoutGrid, Tag, LogOut, Trash2, Bookmark } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; 
import { auth } from '../firebase.js'; 
import { useLinkStore } from '../hooks/useLinkStore.js'; 


// 대시보드 통계 카드 컴포넌트
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-5 rounded-xl shadow-lg border ${color} bg-white transition duration-300 hover:shadow-xl`}>
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <Icon className={`w-6 h-6 ${color.replace('border-gray-200', 'text-indigo-500').replace('border-yellow-200', 'text-yellow-500').replace('border-green-200', 'text-green-500')}`} />
        </div>
        <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
);

// 최근 링크 항목 컴포넌트
const RecentLinkItem = ({ id, title, url, tags, createdAt, isFavorite, onDelete, onToggleFavorite }) => {
    const faviconUrl = url ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` : '';
    const date = createdAt && createdAt.seconds ? new Date(createdAt.seconds * 1000).toLocaleDateString() : '날짜 없음';

    return (
        <div className="flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-gray-50 transition duration-150 group">
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 flex-grow min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {faviconUrl ? (
                        <img 
                            src={faviconUrl} 
                            alt={`${title} favicon`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/d1d5db/4b5563?text=L'; }}
                        />
                    ) : (
                        <Link className="w-4 h-4 text-gray-500" />
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                </div>
            </a>
            <div className="flex-shrink-0 flex items-center space-x-4 ml-4">
                <div className="hidden sm:flex space-x-1">
                    {tags && tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
                <p className="hidden md:block text-xs text-gray-400 w-20 text-right">{date}</p>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onToggleFavorite(id, !isFavorite)}
                        className={`p-1.5 rounded-full ${isFavorite ? 'text-yellow-500 bg-yellow-100' : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-200'} transition`}
                        title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
                    >
                        <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition"
                        title="링크 삭제"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const MainPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // useLinkStore 훅 사용 
    const { links, favoriteLinks, isLoading, addLink, deleteLink, toggleFavorite } = useLinkStore();

    // 통계 계산
    const stats = useMemo(() => {
        const total = links.length;
        const favorites = favoriteLinks.length;
        const categories = new Set(links.map(l => l.category || '미분류')).size;
        return { total, favorites, categories };
    }, [links, favoriteLinks]);

    // 최근 5개 링크만 표시
    const recentLinks = useMemo(() => links.slice(0, 5), [links]);

    // 1. 로그아웃 핸들러
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    };

    // 2. 링크 추가 핸들러 
    const handleAddLink = async (linkData) => {
        try {
            await addLink(linkData, false);
        } catch (error) {
            throw error;
        }
    };

    // 3. 링크 삭제 핸들러 
    const handleDeleteLink = async (linkId) => {
        if (!window.confirm('정말로 이 링크를 삭제하시겠습니까?')) return;
        try {
            await deleteLink(linkId);
        } catch (error) {
            alert(error.message);
        }
    };

    // 4. 즐겨찾기 토글 핸들러 
    const handleToggleFavorite = async (linkId, newStatus) => {
        try {
            await toggleFavorite(linkId, newStatus);
        } catch (error) {
            alert(error.message);
        }
    };


    if (isLoading) {
        return <SharedLayout><div className="text-center py-10 text-gray-500">데이터 로딩 중...</div></SharedLayout>;
    }


    return (
        <SharedLayout>
            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 max-w-7xl mx-auto">
                
                {/* 메인 대시보드 (왼쪽/중앙) */}
                <div className="flex-grow">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">대시보드</h2>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard title="총 링크 수" value={stats.total} icon={Link} color="border-indigo-200" />
                        <StatCard title="즐겨찾기 수" value={stats.favorites} icon={Zap} color="border-yellow-200" />
                        <StatCard title="카테고리 수" value={stats.categories} icon={LayoutGrid} color="border-green-200" />
                    </div>

                    {/* 최근 링크 목록 */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">최근 링크</h3>
                            <button
                                onClick={() => navigate('/search')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition"
                            >
                                전체 링크 보기 &rarr;
                            </button>
                        </div>
                        
                        <div className="space-y-1">
                            {links.length > 0 ? (
                                recentLinks.map(link => (
                                    <RecentLinkItem 
                                        key={link.id} 
                                        {...link}
                                        onDelete={handleDeleteLink}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg mt-4">
                                    <p>아직 저장된 링크가 없습니다. 새 링크를 추가해 보세요!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 사이드바 (오른쪽) */}
                <div className="md:w-72 flex-shrink-0">
                    <div className="sticky top-20 space-y-6">
                        {/* 새 링크 추가 버튼 */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-xl hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                        >
                            <Plus className="w-5 h-5" />
                            <span>새 링크 추가</span>
                        </button>
                        
                        {/* 탐색 메뉴 */}
                        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">탐색</h3>
                            <button onClick={() => navigate('/search')} className="w-full text-left py-2 px-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center space-x-2">
                                <Link className="w-5 h-5" />
                                <span>전체 링크 ({stats.total}개)</span>
                            </button>
                            <button onClick={() => navigate('/favorites')} className="w-full text-left py-2 px-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center space-x-2">
                                <Bookmark className="w-5 h-5" />
                                <span>즐겨찾기 ({stats.favorites}개)</span>
                            </button>
                            <button onClick={() => console.log('Tags Clicked')} className="w-full text-left py-2 px-3 text-gray-700 font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center space-x-2">
                                <Tag className="w-5 h-5" />
                                <span>태그 관리 (미구현)</span>
                            </button>
                        </div>
                        
                        {/* 지원 및 로그아웃 */}
                        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 space-y-4">
                            <div className="text-center pb-2 border-b border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-900">도움이 필요하신가요?</h4>
                                <p className="text-xs text-gray-600">자주 묻는 질문이나 사용 가이드를 확인하세요.</p>
                                <button
                                    onClick={() => console.log('Help Center Clicked')}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center space-x-1 mx-auto mt-2"
                                >
                                    <span>도움말 센터 (미구현)</span> &rarr;
                                </button>
                            </div>
                            <div className="pt-2"> 
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-sm font-semibold text-red-600 border border-red-200 rounded-lg shadow-lg bg-white hover:bg-red-50 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* 링크 추가 모달 */}
            {isModalOpen && (
                <AddLinkModal 
                    onClose={() => setIsModalOpen(false)} 
                    onAdd={handleAddLink} 
                    titleText="새 링크 추가"
                />
            )}
        </SharedLayout>
    );
};

export default MainPage;