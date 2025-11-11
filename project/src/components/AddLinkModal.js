import React, { useState } from 'react';
import { Plus } from 'lucide-react'; 

/**
 * 사용자에게 링크를 입력받는 모달 컴포넌트입니다.
 * @param {object} props - 컴포넌트 속성
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {function} props.onAdd - 링크 추가 핸들러 (linkData) => void (이 함수가 isFavorite 설정을 처리합니다)
 * @param {string} [props.titleText='새 링크 추가'] - 모달 제목
 */
const AddLinkModal = ({ onClose, onAdd, titleText = '새 링크 추가' }) => {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('URL은 필수입니다.');
            return;
        }

        setIsSaving(true);
        setError('');
        
        try {
            // 태그 문자열을 쉼표 또는 공백으로 분리하여 배열로 변환
            const tagsArray = tagsInput.split(/[\s,]+/).filter(t => t.trim() !== '');

            // onAdd 함수(각 페이지에서 정의)를 호출하여 isFavorite 플래그를 포함한 로직 처리
            await onAdd({
                url: url.trim(),
                title: title.trim() || '제목 없음',
                tags: tagsArray,
                category: '기본', 
            });

            onClose(); // 성공 후 모달 닫기
        } catch (err) {
            console.error('링크 저장 오류:', err);
            setError(err.message || '링크 저장에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <Plus className="w-6 h-6 text-indigo-600" />
                    <span>{titleText}</span>
                </h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="link-url" className="block text-sm font-medium text-gray-700">링크 URL</label>
                        <input
                            id="link-url"
                            type="url"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://mylink.com"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="link-title" className="block text-sm font-medium text-gray-700">제목 (선택 사항)</label>
                        <input
                            id="link-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="링크 제목"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="link-tags" className="block text-sm font-medium text-gray-700">태그 (쉼표 또는 공백으로 구분)</label>
                        <input
                            id="link-tags"
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="예: 개발, React, 튜토리얼"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                            disabled={isSaving}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className={`px-5 py-3 rounded-lg text-white font-semibold transition ${isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}`}
                            disabled={isSaving}
                        >
                            {isSaving ? '저장 중...' : '저장하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLinkModal;