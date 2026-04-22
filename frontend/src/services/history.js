import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

export async function saveToHistory(userId, scanType, resultData) {
    if (!userId) return;
    // Don't await the addDoc if we want to avoid UI hangs on network issues
    // Firestore handles its own internal queueing/retrying
    addDoc(collection(db, 'history'), {
        userId,
        scanType,
        data: resultData,
        timestamp: serverTimestamp()
    }).catch(e => {
        console.error("Error saving history (background): ", e);
    });
}

export async function getUserHistory(userId) {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, 'history'),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching history: ", e);
        return [];
    }
}
