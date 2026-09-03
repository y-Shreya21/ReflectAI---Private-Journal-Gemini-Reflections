import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { JournalEntry } from "../types";

// Zero-Hardcoding: Load config from injected firebase-applet-config.json
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Google Auth Provider configured for seamless account selection
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Popup sign-in failed, attempting redirect or fallback:", error);
    if (error?.code === "auth/popup-blocked" || error?.code === "auth/popup-closed-by-user") {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        throw new Error("Authentication popup was blocked. Please allow popups or open in a new tab.");
      }
    }
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export { onAuthStateChanged };

/**
 * Standard Directive: Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Strips all undefined properties recursively before passing to Firestore SDK
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = stripUndefined(value);
      }
    }
    return result as T;
  }
  return obj;
}

// User-Isolated Firestore Interaction Path: /users/{userId}/interactions/{interactionId}
export const saveJournalEntry = async (userId: string, entry: JournalEntry): Promise<void> => {
  if (!userId) throw new Error("Authentication error: userId is required to save entries.");
  const userInteractionsRef = doc(db, "users", userId, "interactions", entry.id);
  const cleanData = stripUndefined(entry);
  await setDoc(userInteractionsRef, cleanData);
};

export const updateJournalEntry = async (
  userId: string,
  entryId: string,
  updates: Partial<JournalEntry>
): Promise<void> => {
  if (!userId || !entryId) throw new Error("Missing parameters for entry update.");
  const entryDocRef = doc(db, "users", userId, "interactions", entryId);
  const cleanData = stripUndefined(updates);
  await updateDoc(entryDocRef, cleanData);
};

export const deleteJournalEntry = async (userId: string, entryId: string): Promise<void> => {
  if (!userId || !entryId) throw new Error("Missing parameters for entry deletion.");
  const entryDocRef = doc(db, "users", userId, "interactions", entryId);
  await deleteDoc(entryDocRef);
};

export const fetchUserJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  if (!userId) return [];
  try {
    const interactionsColl = collection(db, "users", userId, "interactions");
    const q = query(interactionsColl, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as JournalEntry;
      entries.push({
        ...data,
        id: docSnapshot.id
      });
    });
    return entries;
  } catch (err: any) {
    console.error("Error fetching user journal entries:", err);
    // Fallback without ordering if composite index is pending
    try {
      const interactionsColl = collection(db, "users", userId, "interactions");
      const fallbackSnapshot = await getDocs(interactionsColl);
      const entries: JournalEntry[] = [];
      fallbackSnapshot.forEach((docSnapshot) => {
        entries.push({
          ...(docSnapshot.data() as JournalEntry),
          id: docSnapshot.id
        });
      });
      return entries.sort((a, b) => b.createdAt - a.createdAt);
    } catch (fallbackErr) {
      console.error("Fallback query failed:", fallbackErr);
      throw fallbackErr;
    }
  }
};
