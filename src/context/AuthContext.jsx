// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase-config"; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Utility: Create/Update User Document in Firestore ---
  const createUserDocument = async (userAuth, additionalData = {}) => {
    if (!userAuth) return;

    const userRef = doc(db, "users", userAuth.uid);
    
    try {
      const snapshot = await getDoc(userRef);

      // Agar user pehle se nahi hai tabhi naya doc banayein
      if (!snapshot.exists()) {
        const { email, displayName, photoURL } = userAuth;
        const createdAt = serverTimestamp();

        console.log("Saving user to Firestore:", userAuth.uid); // Debug log

        await setDoc(userRef, {
          uid: userAuth.uid,
          email,
          fullName: additionalData.fullName || displayName || "New Operative",
          phoneNumber: additionalData.phoneNumber || "N/A",
          photoURL: photoURL || "",
          role: "user", // Default Role
          createdAt,
          ...additionalData,
        });
        
        console.log("Firestore entry successful!");
      }
    } catch (error) {
      console.error("Error creating user document", error.message);
      throw error; // Isse UI ko pata chalega ki error aaya hai
    }
  };

  // 1. Signup Function (Fixed & Verified)
  const signup = async (email, password, fullName, phoneNumber) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Wait for Firestore to complete before returning
      await createUserDocument(user, { fullName, phoneNumber });
      return user;
    } catch (error) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  };

  // 2. Login Function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 3. Google Login
  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      await createUserDocument(user);
      return user;
    } catch (error) {
      console.error("Google Auth Error:", error.message);
      throw error;
    }
  };

  // 4. Logout Function
  const logout = () => {
    return signOut(auth);
  };

  // 5. Auth State Observer (Real-time Sync)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            // Firestore ka data Auth state mein merge kar rahe hain
            setUser({ ...currentUser, ...docSnap.data() });
          } else {
            setUser(currentUser);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
    googleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};