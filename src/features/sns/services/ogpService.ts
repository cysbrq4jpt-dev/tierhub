import { captureRef } from 'react-native-view-shot';
import { RefObject } from 'react';
import { View } from 'react-native';
import {
  OGPConfig,
  OGPHighlightItem,
  CATCHCOPY_TEMPLATES,
  EmbedConfig,
  EmbedCode,
  generateEmbedCode,
} from '@/types/sns.types';
import { TierDelta } from '@/types/version.types';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://tierhub.app';

// キャッチコピーを自動生成
export const generateCatchCopy = (
  highlightItems: OGPHighlightItem[],
  patchVersion: string
): string => {
  if (highlightItems.length === 0) return `${patchVersion} 最新Tier表`;

  // 最も大きな変化があったキャラを選定
  const mostChanged = highlightItems.find(
    (item) => item.changeDirection === 'up' || item.changeDirection === 'new'
  ) || highlightItems[0];

  // テンプレートをランダム選択して埋め込み
  const templates = [...CATCHCOPY_TEMPLATES];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return template
    .replace('{character}', mostChanged.itemName)
    .replace('{patch}', patchVersion)
    .replace('{tier}', mostChanged.tier)
    .replace('{direction}', mostChanged.changeDirection === 'up' ? '大幅強化' : '調整');
};

// デルタ情報からハイライトアイテムを抽出
export const extractHighlightItems = (
  deltas: TierDelta[],
  itemNames: Record<string, string> // itemId -> name
): OGPHighlightItem[] => {
  return deltas
    .filter((d) => d.direction !== 'same')
    .sort((a, b) => {
      // up > new > down > removed の優先度
      const priority: Record<string, number> = { up: 4, new: 3, down: 2, removed: 1 };
      return (priority[b.direction] || 0) - (priority[a.direction] || 0);
    })
    .slice(0, 5) // 上位5キャラ
    .map((delta) => ({
      itemName: itemNames[delta.itemId] || 'Unknown',
      tier: delta.currentTier,
      previousTier: delta.previousTier || undefined,
      changeDirection: delta.direction === 'removed' ? 'down' as const : delta.direction as any,
    }));
};

// OGP画像として書き出し（Tier表ビュー + キャッチコピー合成）
export const exportOGPImage = async (
  viewRef: RefObject<View>,
  config: OGPConfig
): Promise<string> => {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1.0,
      width: 1200,
      height: 630, // OGP推奨サイズ
      result: 'tmpfile',
    });

    return uri;
  } catch (error) {
    console.error('Failed to export OGP image:', error);
    throw error;
  }
};

// 埋め込みコード生成
export const getEmbedCode = (tierListId: string, options?: Partial<EmbedConfig>): EmbedCode => {
  const config: EmbedConfig = {
    tierListId,
    width: 'responsive',
    height: 'auto',
    theme: 'dark',
    showExplanations: true,
    showBranding: true,
    interactive: true,
    ...options,
  };

  return generateEmbedCode(config, BASE_URL);
};

// X（Twitter）シェアURL生成
export const generateTwitterShareUrl = (
  tierListId: string,
  catchCopy: string
): string => {
  const tierUrl = `${BASE_URL}/tier/${tierListId}`;
  const text = `${catchCopy}\n\n#TierHub`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(tierUrl)}`;
};
