  import { initializeApp } from "firebase/app";
  import { getAuth, GoogleAuthProvider } from "firebase/auth";

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "urbantales-login25.firebaseapp.com",
    projectId: "urbantales-login25",
    storageBucket: "urbantales-login25.appspot.com",
    messagingSenderId: "309927220732",
    appId: "1:309927220732:web:7a745ef3e8283f5a4b0e79",
  };


  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const provider = new GoogleAuthProvider();
