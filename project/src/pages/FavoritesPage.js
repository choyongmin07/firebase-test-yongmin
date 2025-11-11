import React, { useState, useCallback } from 'react';
import SharedLayout from '../components/SharedLayout.js';
import AddLinkModal from '../components/AddLinkModal.js'; // 🚨 새 AddLinkModal 컴포넌트 임포트 🚨
import { Star, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useLinkStore } from '../hooks/useLinkStore.js'; // 🚨 useLinkStore 훅 임포트 🚨

// =========================================================
// 즐겨찾기 링크 항목 컴포넌트 (useLinkStore와 연동)
// =========================================================
const FavoriteLink = ({ id, title, url, onToggleFavorite, onDelete }) => {
    // URL에서 파비콘을 가져오는 로직
    const faviconUrl = url ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` : '';
    const displayLogoText = title ? title[0] : 'L';

    return (
        <div className="border-b border-gray-200 py-4 flex items-start space-x-4 hover:bg-gray-50 transition duration-150">
            
            {/* 왼쪽 로고/파비콘 영역 */}
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300 overflow-hidden shadow-sm">
                {faviconUrl ? (
                    <img 
                        src={faviconUrl} 
                        alt={`${title} favicon`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/d1d5db/4b5563?text=L'; }}
                    />
                ) : (
                    <span className="text-xl font-bold text-gray-500">{displayLogoText}</span>
                )}
            </a>

            {/* 링크 정보 영역 */}
            <div className="flex-grow min-w-0">
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-lg font-semibold text-gray-900 truncate hover:text-indigo-600 transition"
                >
                    {title}
                </a>
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-sm text-indigo-500 truncate mt-1 hover:underline"
                >
                    <LinkIcon className="inline-block w-4 h-4 mr-1 mb-0.5 text-indigo-400" />
                    {url}
                </a>
            </div>

            {/* 액션 버튼 영역 */}
            <div className="flex space-x-2 items-center flex-shrink-0">
                {/* 즐겨찾기 해제 버튼 (토글) */}
                <button 
                    onClick={() => onToggleFavorite(id, false)} // 즐겨찾기 페이지에서는 무조건 해제(false)
                    className="p-2 rounded-full text-yellow-500 bg-yellow-100 hover:bg-yellow-200 transition duration-150 shadow-sm"
                    aria-label="즐겨찾기 해제"
                >
                    <Star className="w-5 h-5 fill-current" />
                </button>

                {/* 삭제 버튼 */}
                <button 
                    onClick={() => onDelete(id)} 
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition duration-150"
                    aria-label="링크 삭제"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


// =========================================================
// FavoritesPage 컴포넌트
// =========================================================

const FavoritesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🚨 useLinkStore 훅을 사용하여 즐겨찾기 링크 데이터와 함수를 가져옵니다. 🚨
    const { favoriteLinks, isLoading, addLink, deleteLink, toggleFavorite } = useLinkStore();

    // 새 북마크 추가 핸들러: isFavorite을 true로 설정하여 저장
    const handleAddFavoriteLink = useCallback(async (linkData) => {
        try {
            // useLinkStore의 addLink 함수를 호출하여 isFavorite = true로 저장
            await addLink(linkData, true);
        } catch (error) {
            // 모달에서 에러 메시지를 표시할 수 있도록 에러를 던집니다.
            throw error;
        }
    }, [addLink]);

    // 링크 삭제 핸들러 (useLinkStore의 deleteLink 사용)
    const handleDeleteLink = async (linkId) => {
        if (!window.confirm('정말로 이 링크를 삭제하시겠습니까?')) return;
        try {
            await deleteLink(linkId);
        } catch (error) {
            alert(error.message);
        }
    };

    // 즐겨찾기 해제 핸들러 (useLinkStore의 toggleFavorite 사용)
    const handleToggleFavorite = async (linkId, newStatus) => {
        try {
            // FavoritesPage에서는 무조건 isFavorite을 false로 업데이트합니다.
            await toggleFavorite(linkId, newStatus);
        } catch (error) {
            alert(error.message);
        }
    };
    
    if (isLoading) {
        return <SharedLayout><div className="text-center py-10 text-gray-500">즐겨찾기 목록 로딩 중...</div></SharedLayout>;
    }


    return (
        <SharedLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Main Content Area */}
                <main className="flex-grow max-w-4xl w-full mx-auto p-6 md:p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                        <Star className="w-8 h-8 text-yellow-500 fill-current" />
                        <span>내 즐겨찾기 링크 ({favoriteLinks.length}개)</span>
                    </h2>
                    
                    <div className="space-y-6">

                        {/* Link List */}
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
                            {favoriteLinks.length > 0 ? (
                                favoriteLinks.map((link) => (
                                    <FavoriteLink 
                                        key={link.id} 
                                        {...link} 
                                        onDelete={handleDeleteLink}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                ))
                            ) : (
                                <div className="p-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                                    <Star className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                                    <p className="text-xl font-medium">
                                        아직 즐겨찾기된 링크가 없습니다.
                                    </p>
                                    <p className="mt-2 text-sm">아래 버튼을 눌러 새 북마크를 바로 추가하거나, 다른 링크를 즐겨찾기에 추가해 보세요.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Button */}
                        <div className="mt-8 pt-4">
                            <button 
                                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-800 text-white font-bold rounded-lg shadow-md hover:bg-gray-900 transition duration-150"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Plus className="w-5 h-5" />
                                <span>새 북마크 추가</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* 링크 추가 모달 */}
            {isModalOpen && (
                <AddLinkModal 
                    onClose={() => setIsModalOpen(false)} 
                    onAdd={handleAddFavoriteLink} // 🚨 즐겨찾기 전용 핸들러 전달 🚨
                    titleText="새 즐겨찾기 북마크 추가" // 모달 제목 변경
                />
            )}
        </SharedLayout>
    );
};

export default FavoritesPage;