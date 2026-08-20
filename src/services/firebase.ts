import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { ComicImport } from '../utils/parser';

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

export const DEFAULT_FIREBASE_CREDS: FirebaseCredentials = {
  apiKey: "AIzaSyCyUnZkl0HfARZnzzeRTVGtwilZ5az3RuE",
  authDomain: "comics-18b71.firebaseapp.com",
  projectId: "comics-18b71",
  appId: "1:258140295261:web:1c5608c4e93eba06387db4"
};

function initFirebase(creds?: FirebaseCredentials) {
  const activeCreds = creds && creds.apiKey ? creds : DEFAULT_FIREBASE_CREDS;
  
  const firebaseConfig = {
    apiKey: activeCreds.apiKey,
    authDomain: activeCreds.authDomain,
    projectId: activeCreds.projectId,
    appId: activeCreds.appId,
  };

  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

export async function saveComicToFirebase(creds: FirebaseCredentials, comic: ComicImport): Promise<void> {
  if (!comic.id) return;
  const app = initFirebase(creds);
  const db = getFirestore(app);
  const docRef = doc(db, 'comics', comic.id);
  const { ...data } = comic;
  await writeBatch(db).set(docRef, data).commit();
}

export async function uploadToFirebase(creds: FirebaseCredentials, comics: ComicImport[]): Promise<void> {
  const app = initFirebase(creds);
  const db = getFirestore(app);

  const batchSize = 300;
  for (let i = 0; i < comics.length; i += batchSize) {
    const currentBatch = comics.slice(i, i + batchSize);
    const batch = writeBatch(db);

    currentBatch.forEach((comic) => {
      if (comic.id) {
        const docRef = doc(db, 'comics', comic.id);
        batch.set(docRef, comic);
      }
    });

    await batch.commit();
  }
}

export async function downloadFromFirebase(creds: FirebaseCredentials): Promise<ComicImport[]> {
  const app = initFirebase(creds);
  const db = getFirestore(app);

  const comicsCol = collection(db, 'comics');
  const q = query(comicsCol, orderBy('ordenLectura', 'asc'));
  const querySnapshot = await getDocs(q);

  const comics: ComicImport[] = [];
  querySnapshot.forEach((doc) => {
    comics.push(doc.data() as ComicImport);
  });

  return comics;
}
