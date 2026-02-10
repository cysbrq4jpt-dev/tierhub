import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useGitHubStore } from '@/stores/githubStore';
import {
  getRepositoryPullRequests,
  getPullRequest,
  getIssueComments,
  GitHubPullRequest,
} from '@/services/github/api';

const PER_PAGE = 20;

interface UsePullRequestsOptions {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
}

export const useRepositoryPullRequests = ({ owner, repo, state = 'open' }: UsePullRequestsOptions) => {
  const { accessToken, isConnected } = useGitHubStore();

  return useInfiniteQuery({
    queryKey: ['github', 'pullRequests', owner, repo, state],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return getRepositoryPullRequests(accessToken, owner, repo, {
        state,
        sort: 'updated',
        direction: 'desc',
        per_page: PER_PAGE,
        page: pageParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined;
      return allPages.length + 1;
    },
    enabled: isConnected && !!accessToken && !!owner && !!repo,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

interface UsePullRequestOptions {
  owner: string;
  repo: string;
  prNumber: number;
}

export const usePullRequest = ({ owner, repo, prNumber }: UsePullRequestOptions) => {
  const { accessToken, isConnected } = useGitHubStore();

  return useQuery({
    queryKey: ['github', 'pullRequest', owner, repo, prNumber],
    queryFn: async () => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return getPullRequest(accessToken, owner, repo, prNumber);
    },
    enabled: isConnected && !!accessToken && !!owner && !!repo && !!prNumber,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePullRequestComments = ({ owner, repo, prNumber }: UsePullRequestOptions) => {
  const { accessToken, isConnected } = useGitHubStore();

  // PR comments use the same endpoint as issue comments
  return useInfiniteQuery({
    queryKey: ['github', 'pullRequest', 'comments', owner, repo, prNumber],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return getIssueComments(accessToken, owner, repo, prNumber, {
        per_page: PER_PAGE,
        page: pageParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined;
      return allPages.length + 1;
    },
    enabled: isConnected && !!accessToken && !!owner && !!repo && !!prNumber,
    staleTime: 1 * 60 * 1000,
  });
};
