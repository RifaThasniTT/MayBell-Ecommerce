import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtxYmIRy8vwL_mERlh7Ht2byEkoQg8Uec",
  authDomain: "maybell-ecommerce.firebaseapp.com",
  projectId: "maybell-ecommerce",
  storageBucket: "maybell-ecommerce.firebasestorage.app",
  messagingSenderId: "635513110284",
  appId: "1:635513110284:web:26e7b6d9b039895ab99329"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };