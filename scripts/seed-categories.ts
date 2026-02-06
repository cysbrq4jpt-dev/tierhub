/**
 * 初期カテゴリーデータをFirestoreにシード
 * 実行方法: npx ts-node scripts/seed-categories.ts
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 初期カテゴリーデータ
const initialCategories = [
  {
    id: 'general',
    name: '一般',
    description: 'その他のTIER表',
    iconUrl: '📊',
    isActive: true,
  },
  {
    id: 'games',
    name: 'ゲーム',
    description: 'ビデオゲーム、モバイルゲーム、ボードゲームなど',
    iconUrl: '🎮',
    isActive: true,
  },
  {
    id: 'anime',
    name: 'アニメ',
    description: 'アニメ作品、キャラクター、シリーズなど',
    iconUrl: '🎌',
    isActive: true,
  },
  {
    id: 'movies',
    name: '映画',
    description: '映画作品、シリーズ、俳優など',
    iconUrl: '🎬',
    isActive: true,
  },
  {
    id: 'music',
    name: '音楽',
    description: 'アーティスト、アルバム、楽曲など',
    iconUrl: '🎵',
    isActive: true,
  },
  {
    id: 'food',
    name: '食べ物',
    description: '料理、お菓子、飲み物など',
    iconUrl: '🍽️',
    isActive: true,
  },
  {
    id: 'sports',
    name: 'スポーツ',
    description: 'スポーツチーム、選手、競技など',
    iconUrl: '⚽',
    isActive: true,
  },
  {
    id: 'travel',
    name: '旅行',
    description: '観光地、都市、国など',
    iconUrl: '✈️',
    isActive: true,
  },
  {
    id: 'books',
    name: '書籍',
    description: '小説、漫画、ノンフィクションなど',
    iconUrl: '📚',
    isActive: true,
  },
  {
    id: 'tech',
    name: 'テクノロジー',
    description: 'ガジェット、ソフトウェア、プログラミング言語など',
    iconUrl: '💻',
    isActive: true,
  },
];

async function seedCategories() {
  try {
    console.log('🔥 Firebase初期化中...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📂 カテゴリーをシード中...\n');

    for (const category of initialCategories) {
      const categoryRef = doc(db, 'categories', category.id);
      await setDoc(categoryRef, {
        ...category,
        tierListsCount: 0,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ ${category.name} (${category.id}) を作成しました`);
    }

    console.log(`\n🎉 ${initialCategories.length}個のカテゴリーを正常にシードしました！`);
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

seedCategories();
