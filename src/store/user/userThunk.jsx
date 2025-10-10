import { auth, db } from "@/config/firebase";
import { getFirebaseErrorMessage } from "@/utils/HelperFunctions";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import toast from "react-hot-toast";

// `loginUser` Thunk
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ payload, onSuccess, onError }, thunkAPI) => {
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );
      const userDoc = await getDoc(doc(db, "users", response.user.uid));

      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        onSuccess(userData);
        return userData;
      } else {
        toast.error("Your account data have been deleted from the database");
        return thunkAPI.rejectWithValue("User data not found");
      }
    } catch (error) {
      console.error("Error: ", error.message);
      toast.error("Invalid login credentials, please try again.");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// `registerUser` Thunk
// export const registerUser = createAsyncThunk(
//   "user/registerUser",
//   async ({ payload, onSuccess }, thunkAPI) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         payload.email,
//         payload.password
//       );
//       const userRef = doc(db, "users", userCredential.user.uid);
//       //  Upload profile picture if exists
//       delete payload.password;
//       delete payload.confirmPassword;
//       await setDoc(userRef, {
//         ...payload,
//         createdAt: serverTimestamp(),
//       });

//       toast.success("Account created successfully");
//       onSuccess();
//       return userCredential.user.uid;
//     } catch (error) {
//       console.error("Error: ", error.message);
//       toast.error(error.message || "Account creation failed");
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   }
// );
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ payload, onSuccess }, thunkAPI) => {
    try {
      // Validate password strength
      if (payload.password.length < 6) {
        throw { code: 'auth/weak-password' };
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );

      // Create user document in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      
      // Remove sensitive data before storing
      const userDataToStore = { ...payload };
      delete userDataToStore.password;
      delete userDataToStore.confirmPassword;

      // Store user data
      await setDoc(userRef, {
        ...userDataToStore,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully");
      onSuccess();
      return userCredential.user.uid;

    } catch (error) {
      console.error("Registration error:", error);
      
      // Get user-friendly error message
      const errorMessage = getFirebaseErrorMessage(error);
      
      // Show error toast
      toast.error(errorMessage);
      
      // Return error for Redux state
      return thunkAPI.rejectWithValue({
        code: error.code || 'unknown',
        message: errorMessage
      });
    }
  }
);

// `loginWithGoogle` Thunk
export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async ({ onSuccess, onError }, thunkAPI) => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const { email, uid, displayName, photoURL } = result.user;
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        onSuccess(userData);
        return userData;
      } else {
        const newUserData = {
          email,
          name: displayName,
          profilePicture: photoURL,
          gender: "",
          createdAt: serverTimestamp(),
        };

        await setDoc(userRef, newUserData);
        onSuccess({ id: uid, ...newUserData });
        return { id: uid, ...newUserData };
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during Google login");
      onError && onError(error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const logout = createAsyncThunk(
  "user/logout",
  async ({ onSuccess }, thunkAPI) => {
    try {
      await signOut(auth);
      onSuccess();
    } catch (error) {
      console.error("Error: ", error.message);
      toast.error(error.message || "Logout failed");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);