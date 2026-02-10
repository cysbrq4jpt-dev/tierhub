import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGitHubStore } from '@/stores/githubStore';
import {
  getRepositoryIssues,
  getIssue,
  createIssue,
  updateIssue,
  getIssueComments,
  createIssueComment,
  GitHubIssue,
  GitHubComment,
} from '@/services/github/api';

const PER_PAGE = 20;

interface UseIssuesOptions {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
}

export const useRepositoryIssues = ({ owner, repo, state = 'open' }: UseIssuesOptions) => {
  const { accessToken, isConnected } = useGitHubStore();

  return useInfiniteQuery({
    queryKey: ['github', 'issues', owner, repo, state],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      const issues = await getRepositoryIssues(accessToken, owner, repo, {
        state,
        sort: 'updated',
        direction: 'desc',
        per_page: PER_PAGE,
        page: pageParam,
      });
      // Filter out pull requests (GitHub API returns PRs in issues endpoint)
      return issues.filter((issue) => !issue.pull_request);
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

interface UseIssueOptions {
  owner: string;
  repo: string;
  issueNumber: number;
}

export const useIssue = ({ owner, repo, issueNumber }: UseIssueOptions) => {
  const { accessToken, isConnected } = useGitHubStore();

  return useQuery({
    queryKey: ['github', 'issue', owner, repo, issueNumber],
    queryFn: async () => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return getIssue(accessToken, owner, repo, issueNumber);
    },
    enabled: isConnected && !!accessToken && !!owner && !!repo && !!issueNumber,
    staleTime: 2 * 60 * 1000,
  });
};

export const useIssueComments = ({ owner, repo, issueNumber }: UseIssueOptions) => {
  const { accessToken, isConnected } = useGitHubStore();

  return useInfiniteQuery({
    queryKey: ['github', 'issue', 'comments', owner, repo, issueNumber],
    queryFn: async ({ pageParam = 1 }) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return getIssueComments(accessToken, owner, repo, issueNumber, {
        per_page: PER_PAGE,
        page: pageParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PER_PAGE) return undefined;
      return allPages.length + 1;
    },
    enabled: isConnected && !!accessToken && !!owner && !!repo && !!issueNumber,
    staleTime: 1 * 60 * 1000,
  });
};

interface CreateIssueData {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
}

export const useCreateIssue = () => {
  const { accessToken } = useGitHubStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ owner, repo, ...data }: CreateIssueData) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return createIssue(accessToken, owner, repo, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['github', 'issues', variables.owner, variables.repo],
      });
    },
  });
};

interface UpdateIssueData {
  owner: string;
  repo: string;
  issueNumber: number;
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  labels?: string[];
  assignees?: string[];
}

export const useUpdateIssue = () => {
  const { accessToken } = useGitHubStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ owner, repo, issueNumber, ...data }: UpdateIssueData) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return updateIssue(accessToken, owner, repo, issueNumber, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['github', 'issue', variables.owner, variables.repo, variables.issueNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ['github', 'issues', variables.owner, variables.repo],
      });
    },
  });
};

interface CreateCommentData {
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
}

export const useCreateIssueComment = () => {
  const { accessToken } = useGitHubStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ owner, repo, issueNumber, body }: CreateCommentData) => {
      if (!accessToken) throw new Error('Not authenticated with GitHub');
      return createIssueComment(accessToken, owner, repo, issueNumber, body);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['github', 'issue', 'comments', variables.owner, variables.repo, variables.issueNumber],
      });
    },
  });
};
