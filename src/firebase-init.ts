import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBZDybETBjiZBYv2cAxQWUSPk5gqC8zYSk',
  authDomain: 'ziro-67067.firebaseapp.com',
  projectId: 'ziro-67067',
  storageBucket: 'ziro-67067.appspot.com',
  messagingSenderId: '331507413882',
  appId: '1:331507413882:web:5d83d556fc67102cdddcc3',
  measurementId: 'G-RYX1D9L7Y6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app);
