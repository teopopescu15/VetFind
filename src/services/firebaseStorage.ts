import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  ref as storageRef,
  refFromURL,
  uploadBytes,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDBO1rR_BYAHGxwfCYho2JsTW_XvQ97mZs',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'vetfind-58a2b.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'vetfind-58a2b',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vetfind-58a2b.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '673682552120',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:673682552120:web:8bf7e353dcdccff3adbdcd',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function uriToBlob(uri: string): Promise<Blob> {
  // `fetch(file://...)` can fail on Android (content://). XHR is more reliable in RN.
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response as Blob);
      };
      xhr.onerror = function () {
        reject(new Error('Failed to read local file for upload'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    } catch (e) {
      reject(e);
    }
  });
}

export async function uploadCompanyPhotoFromUri(companyId: number, uri: string): Promise<string> {
  const blob = await uriToBlob(uri);
  const path = `companies/${companyId}/photos/${Date.now()}_${randomId()}.jpg`;
  const rref = ref(storage, path);
  await uploadBytes(rref, blob, { contentType: blob.type || 'image/jpeg' });
  return await getDownloadURL(rref);
}

export async function uploadCompanyPhotoFromFile(companyId: number, file: File): Promise<string> {
  const path = `companies/${companyId}/photos/${Date.now()}_${randomId()}_${file.name || 'photo.jpg'}`;
  const rref = ref(storage, path);
  await uploadBytes(rref, file, { contentType: file.type || 'image/jpeg' });
  return await getDownloadURL(rref);
}

export async function deleteByDownloadUrl(url: string): Promise<void> {
  // Works for Firebase download URLs
  const rref = refFromURL(url);
  await deleteObject(rref);
}

