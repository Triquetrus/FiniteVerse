import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  signOut,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Failed to set auth persistence, falling back to session:", err);
  setPersistence(auth, browserSessionPersistence).catch((err2) => {
    console.warn("Session persistence failed, falling back to in-memory:", err2);
    setPersistence(auth, inMemoryPersistence).catch((err3) => {
      console.error("All persistence setups failed:", err3);
    });
  });
});

const provider = new GoogleAuthProvider();

const isEmbeddedInIframe = () => {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
};

const saveUserToFirestore = async (user: User) => {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastSignInTime: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (firestoreError) {
    console.error("Firestore error (ignoring for login):", firestoreError);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    if (result.user) await saveUserToFirestore(result.user);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const completeRedirectSignIn = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await saveUserToFirestore(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error completing redirect sign-in:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
