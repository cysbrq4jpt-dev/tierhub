// SNS拡散最適化関連の型定義

// OGP画像生成
export interface OGPConfig {
  tierListId: string;
  title: string;
  categoryName: string;
  patchVersion: string;
  catchCopy: string; // 自動生成キャッチコピー
  topItems: OGPHighlightItem[];
  templateId: string;
}

export interface OGPHighlightItem {
  itemName: string;
  tier: string;
  previousTier?: string; // 前バージョンからの変動表示用
  changeDirection?: 'up' | 'down' | 'same' | 'new';
}

// キャッチコピーテンプレート
export const CATCHCOPY_TEMPLATES = [
  'このパッチで評価が一番上がったのは{character}！',
  '{patch}環境の最強は{character}で決まり！',
  'みんなの予想を覆す！{character}がまさかの{tier}ランク',
  '{character}の時代到来！{patch}最新Tier表',
  '要注意！{character}が{direction}で{tier}入り',
] as const;

export type CatchCopyTemplate = (typeof CATCHCOPY_TEMPLATES)[number];

// インタラクティブ埋め込み
export interface EmbedConfig {
  tierListId: string;
  width: 'responsive' | number; // responsive = 親コンテナに追従
  height: 'auto' | number;
  theme: 'light' | 'dark';
  showExplanations: boolean; // ホバーで解説メモ表示
  showBranding: boolean; // TierHubロゴ表示
  interactive: boolean; // ホバー操作の有無
}

export interface EmbedCode {
  iframe: string;
  script: string;
}

// 埋め込み生成ユーティリティ
export const generateEmbedCode = (config: EmbedConfig, baseUrl: string): EmbedCode => {
  const params = new URLSearchParams({
    theme: config.theme,
    explanations: String(config.showExplanations),
    branding: String(config.showBranding),
    interactive: String(config.interactive),
  });

  if (config.width !== 'responsive') {
    params.set('width', String(config.width));
  }
  if (config.height !== 'auto') {
    params.set('height', String(config.height));
  }

  const embedUrl = `${baseUrl}/embed/tier/${config.tierListId}?${params.toString()}`;

  const widthAttr = config.width === 'responsive' ? '100%' : `${config.width}px`;
  const heightAttr = config.height === 'auto' ? '600' : String(config.height);

  return {
    iframe: `<iframe src="${embedUrl}" width="${widthAttr}" height="${heightAttr}" frameborder="0" style="border:0;border-radius:8px;" allowfullscreen></iframe>`,
    script: `<div id="tierhub-embed-${config.tierListId}"></div>\n<script src="${baseUrl}/embed.js" data-tier-id="${config.tierListId}" data-theme="${config.theme}"></script>`,
  };
};
