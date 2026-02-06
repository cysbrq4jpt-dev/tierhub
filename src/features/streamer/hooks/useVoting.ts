import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useStreamerStore } from '@/stores/streamerStore';
import {
  createVotingSession,
  endVotingSession,
  pauseVotingSession,
  resumeVotingSession,
  submitVote,
  subscribeToVotingSession,
  generateVotingUrl,
} from '../services/votingService';
import { VotingSession, VotingOption } from '@/types/streamer.types';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://tierhub.app';

export const useVoting = (tierListId: string) => {
  const { user } = useAuthStore();
  const { activeSessionId, setActiveSession } = useStreamerStore();
  const [session, setSession] = useState<VotingSession | null>(null);
  const [votingUrl, setVotingUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  // リアルタイム購読
  useEffect(() => {
    if (!activeSessionId) {
      setSession(null);
      return;
    }
    const unsubscribe = subscribeToVotingSession(activeSessionId, setSession);
    return () => unsubscribe();
  }, [activeSessionId]);

  // セッション作成
  const startSession = useCallback(
    async (title: string, options: Omit<VotingOption, 'id' | 'voteCount'>[]) => {
      if (!user) return;
      setIsCreating(true);
      try {
        const newSession = await createVotingSession(tierListId, user.id, title, options);
        setActiveSession(newSession.id);
        const url = generateVotingUrl(newSession.id, BASE_URL);
        setVotingUrl(url);
        return newSession;
      } finally {
        setIsCreating(false);
      }
    },
    [user, tierListId, setActiveSession]
  );

  // セッション終了
  const endSession = useCallback(async () => {
    if (!activeSessionId) return;
    await endVotingSession(activeSessionId);
    setActiveSession(null);
    setVotingUrl('');
  }, [activeSessionId, setActiveSession]);

  // 一時停止
  const pauseSession = useCallback(async () => {
    if (!activeSessionId) return;
    await pauseVotingSession(activeSessionId);
  }, [activeSessionId]);

  // 再開
  const resumeSession = useCallback(async () => {
    if (!activeSessionId) return;
    await resumeVotingSession(activeSessionId);
  }, [activeSessionId]);

  // 投票
  const vote = useCallback(
    async (optionId: string) => {
      if (!activeSessionId) return;
      await submitVote(activeSessionId, optionId, 'anonymous');
    },
    [activeSessionId]
  );

  return {
    session,
    votingUrl,
    isCreating,
    isActive: !!activeSessionId,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    vote,
  };
};
