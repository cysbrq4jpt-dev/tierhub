import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
};

// 画像をリサイズして圧縮
const processImage = async (
  uri: string,
  options: UploadOptions
): Promise<string> => {
  const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth, height: maxHeight } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
};

// 画像アップロード
export const uploadImage = async (
  localUri: string,
  storagePath: string,
  options?: UploadOptions
): Promise<string> => {
  // 画像を処理
  const processedUri = await processImage(localUri, options || {});

  // Blobに変換
  const response = await fetch(processedUri);
  const blob = await response.blob();

  // アップロード
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob);

  // ダウンロードURLを取得
  return await getDownloadURL(storageRef);
};

// プロフィール画像アップロード
export const uploadProfileImage = async (
  userId: string,
  localUri: string
): Promise<string> => {
  const path = `users/${userId}/profile.jpg`;
  return uploadImage(localUri, path, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.9,
  });
};

// TIER表アイテム画像アップロード
export const uploadTierItemImage = async (
  userId: string,
  tierListId: string,
  itemId: string,
  localUri: string
): Promise<string> => {
  const path = `tiers/${userId}/${tierListId}/${itemId}.jpg`;
  return uploadImage(localUri, path, {
    maxWidth: 256,
    maxHeight: 256,
    quality: 0.85,
  });
};

// 画像削除
export const deleteImage = async (storagePath: string): Promise<void> => {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};
