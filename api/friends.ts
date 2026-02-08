import { instance } from "./instance";

// Types
export interface FriendRequest {
  _id: string;
  requester: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  recipient: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Friend {
  _id: string;
  friendshipId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  profilePicture?: string;
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

// API Functions

// Send a friend request by email
export async function sendFriendRequest(email: string): Promise<{ message: string }> {
  try {
    const response = await instance.post("/friends/request", { email });
    return response.data;
  } catch (error) {
    console.log("sendFriendRequest error:", error);
    throw error;
  }
}

// Get pending friend requests (received)
export async function getPendingRequests(): Promise<FriendRequest[]> {
  try {
    const response = await instance.get("/friends/pending");
    return response.data.data;
  } catch (error) {
    console.log("getPendingRequests error:", error);
    throw error;
  }
}

// Get pending request count (for badge)
export async function getPendingCount(): Promise<number> {
  try {
    const response = await instance.get("/friends/pending/count");
    return response.data.data.count;
  } catch (error) {
    console.log("getPendingCount error:", error);
    throw error;
  }
}

// Get sent friend requests (outgoing)
export async function getSentRequests(): Promise<FriendRequest[]> {
  try {
    const response = await instance.get("/friends/sent");
    return response.data.data;
  } catch (error) {
    console.log("getSentRequests error:", error);
    throw error;
  }
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string): Promise<{ message: string }> {
  try {
    const response = await instance.post(`/friends/accept/${requestId}`);
    return response.data;
  } catch (error) {
    console.log("acceptFriendRequest error:", error);
    throw error;
  }
}

// Decline a friend request
export async function declineFriendRequest(requestId: string): Promise<{ message: string }> {
  try {
    const response = await instance.post(`/friends/decline/${requestId}`);
    return response.data;
  } catch (error) {
    console.log("declineFriendRequest error:", error);
    throw error;
  }
}

// Get all accepted friends
export async function getFriends(): Promise<Friend[]> {
  try {
    const response = await instance.get("/friends");
    return response.data.data;
  } catch (error) {
    console.log("getFriends error:", error);
    throw error;
  }
}

// Remove a friend
export async function removeFriend(friendshipId: string): Promise<{ message: string }> {
  try {
    const response = await instance.delete(`/friends/${friendshipId}`);
    return response.data;
  } catch (error) {
    console.log("removeFriend error:", error);
    throw error;
  }
}

// Get friends leaderboard
export async function getFriendsLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await instance.get("/friends/leaderboard");
    return response.data.data;
  } catch (error) {
    console.log("getFriendsLeaderboard error:", error);
    throw error;
  }
}
