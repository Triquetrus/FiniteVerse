const fs = require('fs');

let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const oldConfig = `const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};`;

const oldAppInit = `const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = import.meta.env.VITE_FIREBASE_DATABASE_ID
  ? getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID)
  : getFirestore(app);`;

code = code.replace(oldConfig, '');
code = code.replace('import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";', 'import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";\nimport firebaseConfig from "../../firebase-applet-config.json";');

const newAppInit = `const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);`;

code = code.replace(oldAppInit, newAppInit);

fs.writeFileSync('src/lib/firebase.ts', code);
