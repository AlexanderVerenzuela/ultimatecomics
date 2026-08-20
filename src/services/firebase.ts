import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { ComicImport } from '../utils/parser';

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

function initFirebase(creds: FirebaseCredentials) {
  const firebaseConfig = {
    apiKey: creds.apiKey,
    authDomain: creds.authDomain,
    projectId: creds.projectId,
    appId: creds.appId,
  };

  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

export async function uploadToFirebase(creds: FirebaseCredentials, comics: ComicImport[]): Promise<void> {
  const app = initFirebase(creds);
  const db = getFirestore(app);

  // Firestore write batch limit is 500 documents.
  // We will divide the 854+ comics into batches of 300.
  const batchSize = 300;
  for (let i = 0; i < comics.length; i += batchSize) {
    const currentBatch = comics.slice(i, i + batchSize);
    const batch = writeBatch(db);

    currentBatch.forEach((comic) => {
      if (comic.id) {
        const docRef = doc(db, 'comics', comic.id);
        // Save matching schema fields
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
