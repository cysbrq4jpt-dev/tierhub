import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Unsubscribe,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import {
  createDocument,
  getDocument,
  updateDocument,
  subscribeToDocument,
} from '@/services/firebase/firestore';
import { VotingSession, VotingOption, Vote } from '@/types/streamer.types';

const SESSION_COLLECTION = 'votingSessions';
const VOTE_COLLECTION = 'votes';

// 投票セッション作成
export const createVotingSession = async (
  tierListId: string,
  hostUserId: string,
  title: string,
  options: Omit<VotingOption, 'id' | 'voteCount'>[]
): Promise<VotingSession> => {
  const sessionOptions: VotingOption[] = options.map((opt, index) => ({
    ...opt,
    id: `option_${index}`,
    voteCount: 0,
  }));

  const data = {
    tierListId,
    hostUserId,
    title,
    status: 'active' as const,
    options: sessionOptions,
    totalVotes: 0,
    endedAt: null,
  };

  return createDocument<VotingSession>(SESSION_COLLECTION, data);
};

// 投票セッション取得
export const getVotingSession = async (
  sessionId: string
): Promise<VotingSession | null> => {
  return getDocument<VotingSession>(SESSION_COLLECTION, sessionId);
};

// リアルタイム投票結果購読
export const subscribeToVotingSession = (
  sessionId: string,
  callback: (session: VotingSession | null) => void
): Unsubscribe => {
  return subscribeToDocument<VotingSession>(SESSION_COLLECTION, sessionId, callback);
};

// 投票送信
export const submitVote = async (
  sessionId: string,
  optionId: string,
  voterIp: string
): Promise<void> => {
  const batch = writeBatch(db);

  // 投票レコード作成
  const voteRef = doc(collection(db, VOTE_COLLECTION));
  batch.set(voteRef, {
    id: voteRef.id,
    sessionId,
    optionId,
    voterIp,
    createdAt: new Date(),
  });

  // セッションの投票数更新 — optionsフィールドの更新は
  // Firestoreの配列更新の制約上、sessionドキュメント全体を
  // トランザクションで更新する必要がある
  const sessionRef = doc(db, SESSION_COLLECTION, sessionId);
  batch.update(sessionRef, {
    totalVotes: increment(1),
  });

  await batch.commit();

  // セッションのoptions内の対象optionのvoteCountも更新
  const session = await getVotingSession(sessionId);
  if (session) {
    const updatedOptions = session.options.map((opt) =>
      opt.id === optionId ? { ...opt, voteCount: opt.voteCount + 1 } : opt
    );
    await updateDocument(SESSION_COLLECTION, sessionId, { options: updatedOptions });
  }
};

// セッション一時停止
export const pauseVotingSession = async (sessionId: string): Promise<void> => {
  await updateDocument(SESSION_COLLECTION, sessionId, { status: 'paused' });
};

// セッション再開
export const resumeVotingSession = async (sessionId: string): Promise<void> => {
  await updateDocument(SESSION_COLLECTION, sessionId, { status: 'active' });
};

// セッション終了
export const endVotingSession = async (sessionId: string): Promise<void> => {
  await updateDocument(SESSION_COLLECTION, sessionId, {
    status: 'ended',
    endedAt: new Date(),
  });
};

// QRコード用URLを生成
export const generateVotingUrl = (sessionId: string, baseUrl: string): string => {
  return `${baseUrl}/vote/${sessionId}`;
};
