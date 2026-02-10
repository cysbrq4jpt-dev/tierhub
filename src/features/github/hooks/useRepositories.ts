import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useGitHubStore } from '@/stores/githubStore';
import {
  getUserRepositories,
  searchRepositories,
  GitHubRepository,
} from '@/services/github/api';

const PER_PAGE = 20;

export const useUserRepositories = () => {
  const { accessToken, isConnected } = useGitHubStore();

  return useInfiniteQuery({
    queryKey: ['github', 'repositories', 'user'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return getUserRepositories(accessToken, {
        sort: 'updated',
        per_page: PER_PAGE,
        page: pageParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined;
      return allPages.length + 1;
    },
    enabled: isConnected && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchRepositories = (query: string) => {
  const { accessToken, isConnected } = useGitHubStore();

  return useInfiniteQuery({
    queryKey: ['github', 'repositories', 'search', query],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      const result = await searchRepositories(accessToken, query, {
        sort: 'stars',
        order: 'desc',
        per_page: PER_PAGE,
        page: pageParam,
      });
      return result.items;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined;
      return allPages.length + 1;
    },
    enabled: isConnected && !!accessToken && query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
