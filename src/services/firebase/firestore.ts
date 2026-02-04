import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  increment,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

// Generic CRUD Operations
export const createDocument = async <T extends { id: string }>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> => {
  const docRef = doc(collection(db, collectionName));
  const now = serverTimestamp();

  const documentData = {
    ...data,
    id: docRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, documentData);

  return {
    ...documentData,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as T;
};

export const getDocument = async <T>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertTimestamps(docSnap.data()) as T;
  }
  return null;
};

export const updateDocument = async <T>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

// Query with Pagination
export interface PaginatedResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export const queryDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  pageSize: number = 20,
  lastDocument?: DocumentSnapshot
): Promise<PaginatedResult<T>> => {
  const baseConstraints = [...constraints, limit(pageSize + 1)];

  if (lastDocument) {
    baseConstraints.push(startAfter(lastDocument));
  }

  const q = query(collection(db, collectionName), ...baseConstraints);
  const snapshot = await getDocs(q);

  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;

  return {
    data: docs.map((doc) => convertTimestamps(doc.data()) as T),
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
};

// Real-time Subscription
export const subscribeToDocument = <T>(
  collectionName: string,
  documentId: string,
  callback: (data: T | null) => void
): Unsubscribe => {
  const docRef = doc(db, collectionName, documentId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(convertTimestamps(docSnap.data()) as T);
    } else {
      callback(null);
    }
  });
};

export const subscribeToQuery = <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): Unsubscribe => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => convertTimestamps(doc.data()) as T);
    callback(data);
  });
};

// Batch Operations
export const batchWrite = async (
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    id: string;
    data?: Record<string, unknown>;
  }>
): Promise<void> => {
  const batch = writeBatch(db);

  operations.forEach((op) => {
    const docRef = doc(db, op.collection, op.id);
    switch (op.type) {
      case 'set':
        batch.set(docRef, { ...op.data, updatedAt: serverTimestamp() });
        break;
      case 'update':
        batch.update(docRef, { ...op.data, updatedAt: serverTimestamp() });
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  });

  await batch.commit();
};

// Counter Operations
export const incrementCounter = async (
  collectionName: string,
  documentId: string,
  field: string,
  value: number = 1
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    [field]: increment(value),
  });
};

// Utility: Convert Firestore Timestamps to Date
const convertTimestamps = (data: Record<string, unknown>): Record<string, unknown> => {
  const converted = { ...data };
  Object.keys(converted).forEach((key) => {
    const value = converted[key];
    if (value && typeof value === 'object' && 'toDate' in value) {
      converted[key] = (value as { toDate: () => Date }).toDate();
    }
  });
  return converted;
};
