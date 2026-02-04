# TierHub

個人の好みを可視化し、議論を通じて集合知へ昇華させるTIER表特化型SNSプラットフォーム

## 技術スタック

- **フレームワーク**: React Native + Expo
- **ルーティング**: Expo Router
- **言語**: TypeScript
- **スタイリング**: NativeWind (Tailwind CSS for React Native)
- **状態管理**: Zustand
- **データフェッチング**: TanStack Query (React Query)
- **バックエンド**: Firebase (Auth, Firestore, Storage)
- **UI/UX**: Drag & Drop (react-native-draggable-flatlist)

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、Firebase設定を追加：

```bash
cp .env.example .env
```

`.env`ファイルに以下を設定：

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

### 3. 開発サーバーの起動

```bash
npm start
```

その後、以下のいずれかを選択：

- `i` - iOS Simulator
- `a` - Android Emulator
- `w` - Web ブラウザ
- QRコードをスキャン - 実機で Expo Go アプリを使用

## プロジェクト構造

```
tierhub/
├── app/                    # Expo Router のページ
│   ├── (auth)/            # 認証グループ
│   ├── (main)/            # メイングループ
│   │   └── (tabs)/        # タブナビゲーション
│   └── _layout.tsx        # ルートレイアウト
├── src/
│   ├── components/        # UIコンポーネント
│   ├── features/          # 機能モジュール（ドメイン別）
│   ├── hooks/             # グローバルフック
│   ├── stores/            # Zustand状態管理
│   ├── services/          # Firebase, API サービス
│   ├── utils/             # ユーティリティ
│   └── types/             # グローバル型定義
├── docs/                  # ドキュメント
└── functions/             # Firebase Cloud Functions
```

## 開発フェーズ

### Phase 1: MVP（最小実行可能製品）
- ✅ プロジェクト初期設定
- ✅ NativeWind セットアップ
- 🔄 認証機能
- 🔄 TIER表作成・編集
- 🔄 SNS基盤（いいね、コメント、フォロー）
- 🔄 画像書き出し・共有

### Phase 2: コミュニティ強化
- タイムライン
- プッシュ通知
- 投票機能・ヒートマップ
- ランキング

### Phase 3: 集合知
- みんなのTIER表自動生成
- カテゴリ拡張
- モデレーション

## スタイリング（NativeWind）

Tailwind CSSのユーティリティクラスを使用：

```tsx
<View className="flex-1 bg-dark p-4">
  <Text className="text-2xl font-bold text-white">Title</Text>
</View>
```

### カスタムカラー

TIER表カラー：
- `tier-S`: #FF7F7F (赤)
- `tier-A`: #FFBF7F (オレンジ)
- `tier-B`: #FFDF7F (黄)
- `tier-C`: #FFFF7F (ライトイエロー)
- `tier-D`: #BFFF7F (ライトグリーン)
- `tier-F`: #7FBFFF (ライトブルー)

## ライセンス

Private
