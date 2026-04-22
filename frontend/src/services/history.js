import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

export async function saveToHistory(userId, scanType, resultData) {
    if (!userId) return;
    
    const newEntry = {
        userId,
        scanType,
        data: resultData,
        timestamp: new Date().toISOString()
    };

    // 1. Save to LocalStorage (Immediate Fallback)
    try {
        const localHistory = JSON.parse(localStorage.getItem(`history_${userId}`) || '[]');
        localHistory.unshift({ ...newEntry, id: `local_${Date.now()}` });
        localStorage.setItem(`history_${userId}`, JSON.stringify(localHistory.slice(0, 50)));
    } catch (e) {
        console.error("Local storage error:", e);
    }

    // 2. Save to Firestore (Persistent Cloud Storage)
    addDoc(collection(db, 'history'), {
        ...newEntry,
        timestamp: serverTimestamp()
    }).catch(e => {
        console.error("Error saving history (background): ", e);
    });
}

export async function getUserHistory(userId) {
    if (!userId) return [];
    
    let combinedHistory = [];

    // 1. Try to get from Firestore
    try {
        const q = query(
            collection(db, 'history'),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const firestoreHistory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        combinedHistory = [...firestoreHistory];
    } catch (e) {
        console.error("Error fetching Firestore history: ", e);
    }

    // 2. Supplement with LocalStorage (useful if Firestore is blocked or empty)
    try {
        const localHistory = JSON.parse(localStorage.getItem(`history_${userId}`) || '[]');
        // Avoid duplicates if we have both
        const firestoreIds = new Set(combinedHistory.map(h => h.id));
        localHistory.forEach(item => {
            if (!firestoreIds.has(item.id)) {
                combinedHistory.push(item);
            }
        });
    } catch (e) {
        console.error("Local storage fetch error:", e);
    }

    // Sort combined by timestamp
    return combinedHistory.sort((a, b) => {
        const tA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const tB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return tB - tA;
    });
}
