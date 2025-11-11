import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout.js'; 
import { Search, Link, Trash2, Bookmark } from 'lucide-react'; 
import { useLinkStore } from '../hooks/useLinkStore.js'; 

// LinkItem 컴포넌트 (편의상 SearchPage에 포함)
const LinkItem = ({ link, onDelete, onToggleFavorite }) => {
    // URL에서 도메인만 추출하는 함수
    const getDomain = (url) => {
        try {
            const domain = (new URL(url)).hostname.replace('www.', '');
            return domain;
        } catch (e) {
            return url;
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md transition duration-200 hover:shadow-lg hover:ring-2 hover:ring-indigo-100">
            <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 min-w-0"
            >
                <div className="text-lg font-semibold text-gray-900 truncate">
                    {link.title || '제목 없음'}
                </div>
                <div className="text-sm text-indigo-600 mt-1 flex items-center space-x-2">
                    <Link className="w-4 h-4" />
                    <span className="truncate">{getDomain(link.url)}</span>
                </div>
                {link.tags && link.tags.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-1">
                        {link.tags.map(tag => (
                            <span 
                                key={tag} 
                                className="px-2 py-0.5 bg-gray-100 rounded-full font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </a>
            <div className="flex items-center space-x-2 ml-4">
                <button
                    onClick={() => onToggleFavorite(link.id, !link.isFavorite)}
                    className={`p-2 rounded-full transition duration-150 ${
                        link.isFavorite 
                            ? 'text-yellow-500 bg-yellow-100 hover:bg-yellow-200' 
                            : 'text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-yellow-500'
                    }`}
                    title={link.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                    <Bookmark className="w-5 h-5 fill-current" />
                </button>
                <button
                    onClick={() => onDelete(link.id)}
                    className="p-2 text-red-500 bg-red-100 rounded-full hover:bg-red-200 transition duration-150"
                    title="링크 삭제"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


const SearchPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearchTerm = queryParams.get('q') || '';
    
    const { links: allLinks, deleteLink, toggleFavorite } = useLinkStore();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

    // 검색 로직을 useMemo를 사용하여 최적화
    const filteredLinks = useMemo(() => {
        if (!searchTerm) {
            return allLinks;
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase();

        // ⭐️ 핵심 수정: 오직 제목만으로 검색 ⭐️
        // 'soop', '숲', 's' 등 모든 검색어에 대해 URL, 태그 확인 없이 제목만 확인합니다.
        return allLinks.filter(link => {
            // 제목 매칭 (한글 검색 포함)
            const titleMatch = link.title?.toLowerCase().includes(lowerSearchTerm);
            
            return titleMatch;
        });

    }, [allLinks, searchTerm]);


    // 검색어 입력 핸들러 (사용자가 직접 입력할 때)
    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };


    return (
        <SharedLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Search className="w-8 h-8 mr-3 text-indigo-600" />
                    검색 결과
                </h1>
                
                {/* 검색 입력 필드 */}
                <div className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            // 안내 메시지 변경: 이제 제목만 검색
                            placeholder="검색할 링크의 제목을 입력하세요..." 
                            value={searchTerm}
                            onChange={handleInputChange} 
                            className="w-full py-3 pl-12 pr-4 text-gray-700 border border-gray-300 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* 검색 결과 목록 */}
                <div className="mb-10">
                    <p className="text-xl font-semibold text-gray-700 mb-4">
                        총 <span className="text-indigo-600">{filteredLinks.length}개</span>의 링크를 찾았습니다.
                    </p>
                    
                    {filteredLinks.length > 0 ? (
                        // 리스트 스타일 변경: MainPage의 최근 링크 목록과 동일하게
                        <div className="space-y-4"> 
                            {filteredLinks.map(link => (
                                <LinkItem 
                                    key={link.id} 
                                    link={link} 
                                    onDelete={deleteLink} 
                                    onToggleFavorite={toggleFavorite} // 즐겨찾기 토글 핸들러 전달
                                />
                            ))}
                        </div>
                    ) : (
                        // 검색 결과 없음 스타일 변경
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-xl font-semibold">검색 결과 없음</p>
                            <p className="text-md mt-1">검색어 "<span className="font-medium text-gray-700">{searchTerm}</span>"에 해당하는 링크를 찾을 수 없습니다.</p>
                            <p className="text-sm mt-3">이제는 제목 기준으로만 검색합니다.</p>
                        </div>
                    )}
                </div>

            </div>
        </SharedLayout>
    );
};

export default SearchPage;