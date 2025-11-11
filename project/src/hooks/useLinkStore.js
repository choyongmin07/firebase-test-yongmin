import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from '../firebase.js'; // Firestore/Auth 인스턴스 임포트

/**
 * 모든 링크 데이터와 관리 로직을 제공하는 커스텀 Hook입니다.
 * Firestore 실시간 리스너를 통해 데이터를 가져오고 CRUD 함수를 제공합니다.
 */
export const useLinkStore = () => {
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    // 1. Auth 및 Firestore 실시간 리스너 설정
    useEffect(() => {
        if (!auth || !db) {
            console.warn("Firebase 또는 Auth 인스턴스가 준비되지 않았습니다.");
            setIsLoading(false);
            return;
        }

        let unsubscribeSnapshot = () => {};

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                const userId = currentUser.uid;
                const linksCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'links');
                
                // 최신순으로 정렬된 모든 링크 쿼리
                const q = query(linksCollectionRef, orderBy('createdAt', 'desc'));
                
                // 실시간 리스너 설정
                unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const fetchedLinks = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setLinks(fetchedLinks);
                    setIsLoading(false);
                    console.log(`Firestore에서 ${fetchedLinks.length}개 링크를 실시간으로 가져옴.`);
                }, (error) => {
                    console.error("Firestore 실시간 데이터 로드 오류:", error);
                    setIsLoading(false);
                });

            } else {
                // 로그아웃 상태
                setLinks([]); 
                setIsLoading(false);
            }
        });

        // 컴포넌트 언마운트 시 리스너 정리
        return () => {
            unsubscribeAuth();
            unsubscribeSnapshot();
        };
    }, []);

    // 2. CRUD 함수 정의

    /**
     * 새 링크를 Firestore에 추가합니다.
     * @param {object} linkData - 링크 데이터 (url, title, tags, category)
     * @param {boolean} isFavorite - 즐겨찾기 여부 (MainPage=false, FavoritesPage=true)
     */
    const addLink = useCallback(async (linkData, isFavorite = false) => {
        if (!user) throw new Error("사용자 인증 정보 없음");
        
        try {
            const linksCollectionRef = collection(db, 'artifacts', appId, 'users', user.uid, 'links');
            await addDoc(linksCollectionRef, {
                ...linkData,
                isFavorite: isFavorite, // 🚨 전달받은 isFavorite 상태로 저장 🚨
                userId: user.uid,
                createdAt: new Date(),
            });
            console.log(`링크가 isFavorite=${isFavorite} 상태로 성공적으로 추가되었습니다.`);
        } catch (e) {
            console.error('Firestore에 링크 추가 오류:', e);
            throw new Error('링크 추가 중 오류가 발생했습니다.');
        }
    }, [user]);

    /**
     * 링크를 삭제합니다.
     */
    const deleteLink = useCallback(async (linkId) => {
        if (!user) throw new Error("사용자 인증 정보 없음");

        try {
            const linkDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'links', linkId);
            await deleteDoc(linkDocRef);
            console.log(`링크 ID: ${linkId} 삭제 완료`);
        } catch (e) {
            console.error('Firestore에서 링크 삭제 오류:', e);
            throw new Error('링크 삭제 중 오류가 발생했습니다.');
        }
    }, [user]);

    /**
     * 링크의 즐겨찾기 상태를 토글합니다.
     */
    const toggleFavorite = useCallback(async (linkId, newStatus) => {
        if (!user) throw new Error("사용자 인증 정보 없음");

        try {
            const linkDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'links', linkId);
            await updateDoc(linkDocRef, {
                isFavorite: newStatus
            });
            console.log(`링크 ID: ${linkId} 즐겨찾기 상태 변경 완료: ${newStatus}`);
        } catch (e) {
            console.error('Firestore에서 즐겨찾기 상태 업데이트 오류:', e);
            throw new Error('즐겨찾기 상태 변경 중 오류가 발생했습니다.');
        }
    }, [user]);

    // 3. 파생된 상태 (즐겨찾기 링크만 필터링)
    const favoriteLinks = useMemo(() => {
        return links.filter(link => link.isFavorite);
    }, [links]);

    return {
        links, // 전체 링크
        favoriteLinks, // 즐겨찾기된 링크
        isLoading,
        addLink,
        deleteLink,
        toggleFavorite,
    };
};
export default useLinkStore