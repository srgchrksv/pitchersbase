import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
  import { auth, db } from './firebase';
  import { useState, useEffect } from "react";
  
  // Sign up a new user
  export const signUp = async (email, password, username, selectedRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(selectedRole)
      if (selectedRole == 'catchers') {
        await setDoc(doc(collection(db, selectedRole), user.uid), { id: user.uid}, { merge: true });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Log in an existing user
  export const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // Log out the current user
  export const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };
  
  // Check if a user is an admin
  export const isAdmin = async (user) => {
    if (!user) return false;
    
    const userDoc = await getDoc(doc(db, 'catchers', user.uid));
    return userDoc.exists()
  };
  

  export const checkAdminStatus = async (user, setIsAdmin) => {
    try {
      const result = await isAdmin(user);
      setIsAdmin(result);
    } catch (error) {
      console.error('Error checking admin status:', error);
      // Handle error, e.g., set isAdmin to false or show an error message
    }
  };

  // Custom hook to get the current user
  export const useAuth = () => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
  
      return () => unsubscribe();
    }, []);
  
    return user;
  };