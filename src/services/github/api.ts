const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
}

async function githubRequest<T>(
  endpoint: string,
  accessToken: string,
  options: GitHubRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options;

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

// Types
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  private: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  pull_request?: {
    url: string;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  merged: boolean;
  mergeable: boolean | null;
  comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
}

export interface GitHubComment {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
}

// API Functions

export async function getCurrentUser(accessToken: string): Promise<GitHubUser> {
  return githubRequest<GitHubUser>('/user', accessToken);
}

export async function getUserRepositories(
  accessToken: string,
  options?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    per_page?: number;
    page?: number;
  }
): Promise<GitHubRepository[]> {
  const params = new URLSearchParams();
  if (options?.sort) params.append('sort', options.sort);
  if (options?.per_page) params.append('per_page', options.per_page.toString());
  if (options?.page) params.append('page', options.page.toString());

  const query = params.toString();
  return githubRequest<GitHubRepository[]>(
    `/user/repos${query ? `?${query}` : ''}`,
    accessToken
  );
}

export async function getRepositoryIssues(
  accessToken: string,
  owner: string,
  repo: string,
  options?: {
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }
): Promise<GitHubIssue[]> {
  const params = new URLSearchParams();
  if (options?.state) params.append('state', options.state);
  if (options?.sort) params.append('sort', options.sort);
  if (options?.direction) params.append('direction', options.direction);
  if (options?.per_page) params.append('per_page', options.per_page.toString());
  if (options?.page) params.append('page', options.page.toString());

  const query = params.toString();
  return githubRequest<GitHubIssue[]>(
    `/repos/${owner}/${repo}/issues${query ? `?${query}` : ''}`,
    accessToken
  );
}

export async function getRepositoryPullRequests(
  accessToken: string,
  owner: string,
  repo: string,
  options?: {
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'popularity' | 'long-running';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }
): Promise<GitHubPullRequest[]> {
  const params = new URLSearchParams();
  if (options?.state) params.append('state', options.state);
  if (options?.sort) params.append('sort', options.sort);
  if (options?.direction) params.append('direction', options.direction);
  if (options?.per_page) params.append('per_page', options.per_page.toString());
  if (options?.page) params.append('page', options.page.toString());

  const query = params.toString();
  return githubRequest<GitHubPullRequest[]>(
    `/repos/${owner}/${repo}/pulls${query ? `?${query}` : ''}`,
    accessToken
  );
}

export async function getIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssue> {
  return githubRequest<GitHubIssue>(
    `/repos/${owner}/${repo}/issues/${issueNumber}`,
    accessToken
  );
}

export async function getPullRequest(
  accessToken: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<GitHubPullRequest> {
  return githubRequest<GitHubPullRequest>(
    `/repos/${owner}/${repo}/pulls/${prNumber}`,
    accessToken
  );
}

export async function createIssue(
  accessToken: string,
  owner: string,
  repo: string,
  data: {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }
): Promise<GitHubIssue> {
  return githubRequest<GitHubIssue>(
    `/repos/${owner}/${repo}/issues`,
    accessToken,
    { method: 'POST', body: data }
  );
}

export async function updateIssue(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  data: {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
    assignees?: string[];
  }
): Promise<GitHubIssue> {
  return githubRequest<GitHubIssue>(
    `/repos/${owner}/${repo}/issues/${issueNumber}`,
    accessToken,
    { method: 'PATCH', body: data }
  );
}

export async function getIssueComments(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  options?: {
    per_page?: number;
    page?: number;
  }
): Promise<GitHubComment[]> {
  const params = new URLSearchParams();
  if (options?.per_page) params.append('per_page', options.per_page.toString());
  if (options?.page) params.append('page', options.page.toString());

  const query = params.toString();
  return githubRequest<GitHubComment[]>(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments${query ? `?${query}` : ''}`,
    accessToken
  );
}

export async function createIssueComment(
  accessToken: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<GitHubComment> {
  return githubRequest<GitHubComment>(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    accessToken,
    { method: 'POST', body: { body } }
  );
}

export async function searchRepositories(
  accessToken: string,
  query: string,
  options?: {
    sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }
): Promise<{ total_count: number; items: GitHubRepository[] }> {
  const params = new URLSearchParams();
  params.append('q', query);
  if (options?.sort) params.append('sort', options.sort);
  if (options?.order) params.append('order', options.order);
  if (options?.per_page) params.append('per_page', options.per_page.toString());
  if (options?.page) params.append('page', options.page.toString());

  return githubRequest<{ total_count: number; items: GitHubRepository[] }>(
    `/search/repositories?${params.toString()}`,
    accessToken
  );
}
