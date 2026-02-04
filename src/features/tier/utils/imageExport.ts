import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { RefObject } from 'react';
import { View } from 'react-native';

interface ExportOptions {
  format?: 'png' | 'jpg';
  quality?: number;
  width?: number;
}

// TIER表をViewrefから画像として書き出し
export const exportTierListAsImage = async (
  viewRef: RefObject<View>,
  options: ExportOptions = {}
): Promise<string> => {
  const { format = 'png', quality = 1.0, width = 1200 } = options;

  try {
    const uri = await captureRef(viewRef, {
      format,
      quality,
      width,
      result: 'tmpfile',
    });

    return uri;
  } catch (error) {
    console.error('Failed to capture tier list:', error);
    throw error;
  }
};

// 画像をSNSに共有
export const shareTierListImage = async (
  viewRef: RefObject<View>,
  title: string
): Promise<void> => {
  try {
    const uri = await exportTierListAsImage(viewRef);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: title,
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Failed to share tier list:', error);
    throw error;
  }
};

// 画像をローカルに保存
export const saveTierListImage = async (
  viewRef: RefObject<View>,
  fileName: string
): Promise<string> => {
  try {
    const uri = await exportTierListAsImage(viewRef);
    const destinationUri = `${FileSystem.documentDirectory}${fileName}.png`;

    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Failed to save tier list:', error);
    throw error;
  }
};
