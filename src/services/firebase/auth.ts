import {
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth, db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types/user.types';

// Google Sign In
export const signInWithGoogle = async (idToken: string): Promise<User> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return await getOrCreateUser(result.user);
};

// Apple Sign In
export const signInWithApple = async (): Promise<User> => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const provider = new OAuthProvider('apple.com');
  const oauthCredential = provider.credential({
    idToken: credential.identityToken!,
  });

  const result = await signInWithCredential(auth, oauthCredential);

  // Apple Sign Inでは名前が最初の1回しか取れないので保存
  const displayName =
    credential.fullName?.givenName && credential.fullName?.familyName
      ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
      : undefined;

  return await getOrCreateUser(result.user, displayName);
};

// ユーザー取得または作成
const getOrCreateUser = async (
  firebaseUser: FirebaseUser,
  displayName?: string
): Promise<User> => {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as User;
    }

    // 新規ユーザー作成
    const newUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || 'ユーザー',
      photoURL: firebaseUser.photoURL,
      bio: '',
      followersCount: 0,
      followingCount: 0,
      tierListsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, newUser);

    return {
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  } catch (error) {
    console.warn('⚠️ Firestore error, using Firebase Auth user data only:', error);

    // Firestoreでエラーが発生した場合、Firebase Authのユーザー情報のみを使用
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || 'ユーザー',
      photoURL: firebaseUser.photoURL || null,
      bio: '',
      followersCount: 0,
      followingCount: 0,
      tierListsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }
};

// Sign Out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Auth State Observer
export const subscribeToAuthState = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        callback({
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as User);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};
