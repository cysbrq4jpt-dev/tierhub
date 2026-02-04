export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  followersCount: number;
  followingCount: number;
  tierListsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

export interface UpdateUserInput {
  displayName?: string;
  photoURL?: string;
  bio?: string;
}
