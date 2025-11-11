import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout.js'; // SharedLayout 컴포넌트 경로 가정
import { User, Mail, Globe, Hash, Save, Camera } from 'lucide-react';
import { db, appId } from '../firebase'; // db와 appId는 firebase.js에서 가져온다고 가정
import { auth } from '../firebase.js'; // auth는 firebase.js에서 가져온다고 가정
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // 인증 상태 변경 리스너 추가

// 입력 필드 컴포넌트
const InputField = ({ label, name, value, onChange, type = 'text', as = 'input', icon: Icon, readOnly = false }) => (
    <div className="space-y-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-900">
            {label}
        </label>
        
        <div className="relative">
            {as === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    rows={4}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                />
            )}
            {/* 아이콘은 스타일 이미지와 다소 달라 생략하거나, 필요하다면 여기에 배치할 수 있습니다. */}
        </div>
    </div>
);

// 프로필 페이지 메인 컴포넌트
const UserProfilePage = () => {
    const navigate = useNavigate();
    
    // 초기 폼 데이터 상태 (실제 데이터에 맞게 조정)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        website: '',
        bio: '',
        userId: '', // 사용자 ID를 폼에 저장할 필요는 없지만, 디버깅을 위해 유지
        // avatarUrl: 'placeholder'
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const [message, setMessage] = useState(null); // 메시지 (성공/실패)

    // Firestore 문서 참조를 가져오는 헬퍼 함수
    const getProfileDocRef = (uid) => {
        if (!uid || !appId || !db) return null;
        // MANDATORY PRIVATE DATA PATH 사용: artifacts/{appId}/users/{userId}/profile/userProfile
        return doc(db, 'artifacts', appId, 'users', uid, 'profile', 'userProfile');
    };

    // 프로필 데이터를 Firestore에서 로드
    const loadUserProfile = async (uid) => {
        if (!uid) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const docRef = getProfileDocRef(uid);
            if (!docRef) throw new Error("Firestore document reference could not be created.");
            
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    email: auth.currentUser?.email || data.email || '이메일 없음', // 인증된 이메일 사용
                    userId: uid,
                }));
            } else {
                // 문서가 없는 경우, 기본값과 인증 정보로 초기화
                setFormData(prev => ({
                    ...prev,
                    email: auth.currentUser?.email || '이메일 없음',
                    userId: uid,
                }));
                console.log("No existing profile data found. Using authenticated defaults.");
            }
            setIsLoading(false);
        } catch (error) {
            console.error("프로필 로드 오류:", error);
            setMessage({ type: 'error', text: `프로필 로드 실패: ${error.message}` });
            setIsLoading(false);
        }
    };

    // Firebase 인증 상태 변경 감지 및 데이터 로드 시작
    useEffect(() => {
        // onAuthStateChanged는 인증 상태가 변경될 때마다(로그인/로그아웃) 호출됩니다.
        // 초기 로드 시에도 현재 사용자 정보를 제공합니다.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // 사용자가 인증된 경우 (익명 로그인 포함)
                loadUserProfile(user.uid);
            } else {
                // 사용자가 없는 경우, 메인 페이지 또는 로그인 페이지로 리다이렉션 고려
                // 여기서는 일단 로딩을 멈추고 메시지를 표시
                setFormData(prev => ({ ...prev, userId: null, email: '로그인이 필요합니다' }));
                setIsLoading(false);
                // navigate('/login'); // 예시: 로그인 페이지로 이동
            }
        });
        
        return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 정리
    }, []); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 프로필 저장 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = auth.currentUser?.uid;
        if (!userId || isSaving || isLoading) {
            console.error("User ID is missing or currently loading/saving. Cannot save profile.");
            setMessage({ type: 'error', text: '사용자 정보가 준비되지 않아 저장할 수 없습니다.' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const docRef = getProfileDocRef(userId);
            if (!docRef) throw new Error("Firestore document reference could not be created for saving.");

            const dataToSave = {
                username: formData.username || '익명 사용자', // 사용자 이름이 없으면 기본값 사용
                email: formData.email, 
                website: formData.website,
                bio: formData.bio,
            };

            // setDoc에 { merge: true }를 사용하여 기존 필드는 보존하고 새 필드만 업데이트합니다.
            await setDoc(docRef, dataToSave, { merge: true });
            setMessage({ type: 'success', text: '프로필이 성공적으로 저장되었습니다!' });
        } catch (error) {
            console.error("프로필 저장 오류:", error);
            setMessage({ type: 'error', text: `저장 실패: ${error.message}` });
        } finally {
            setIsSaving(false);
            // 2초 후 메시지 초기화
            setTimeout(() => setMessage(null), 2000);
        }
    };


    if (isLoading) {
        return (
            <SharedLayout title="프로필 설정">
                <div className="flex justify-center items-center h-48 text-gray-500">
                    프로필 데이터를 로드 중입니다...
                </div>
            </SharedLayout>
        );
    }
    
    // UI 렌더링
    return (
        <SharedLayout title="프로필 설정">
            <div className="max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xl">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">내 프로필 편집</h1>
                <p className="text-gray-600 mb-8">다른 사용자에게 보여줄 정보를 설정하세요. **유저 ID:** <span className="font-mono text-sm text-indigo-600 break-all">{formData.userId || '로딩 중...'}</span></p>

                {/* 메시지 표시 영역 */}
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm font-semibold ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* 아바타 영역 (미구현 상태로 가정, Camera 아이콘만 표시) */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center relative border-4 border-white shadow-lg">
                            {/* 실제 아바타 이미지가 로드될 위치 */}
                            <span className="text-4xl text-gray-500 font-bold">😊</span>
                            {/* 아바타 변경 버튼 */}
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition duration-150 shadow-md"
                                onClick={() => console.log('Change avatar clicked')}
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{formData.username || '사용자 이름'}</h2>
                    </div>

                    {/* 사용자 이름 */}
                    <InputField 
                        label="사용자 이름" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange}
                        icon={User} 
                    />

                    {/* 이메일 (읽기 전용) */}
                    <InputField 
                        label="이메일 (인증됨)" 
                        name="email" 
                        value={formData.email} 
                        readOnly={true} // 이메일은 변경 불가
                        icon={Mail} 
                    />
                    
                    {/* 웹사이트/블로그 */}
                    <InputField 
                        label="웹사이트/블로그 URL" 
                        name="website" 
                        value={formData.website} 
                        onChange={handleChange}
                        icon={Globe} 
                    />
                    
                    {/* 자기소개/메시지 */}
                    <InputField 
                        label="자기소개 또는 메시지" 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange}
                        as="textarea" 
                        icon={User}
                    />
                    
                    {/* 저장 버튼: 이미지의 검은색 버튼 스타일 반영 */}
                    <button
                        type="submit"
                        disabled={isSaving || isLoading} // 로딩 중에도 저장 불가
                        className={`w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-lg shadow-md text-lg font-bold text-white transition duration-150 mt-8
                        ${isSaving || isLoading
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : 'bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800'}`
                        }
                    >
                        <Save className="w-5 h-5" />
                        <span>{isSaving ? '저장 중...' : '저장하기'}</span>
                    </button>
                </form>

            </div>
            {/* SharedLayout의 다른 요소는 이미지에 없으므로 여기서 마무리 */}
        </SharedLayout>
    );
};

export default UserProfilePage;