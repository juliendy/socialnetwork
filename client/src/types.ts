export interface User {
    id: number;
    first: string;
    last: string;
    email: string;
    image_url?: string;
    bio?: string;
}

export enum FriendshipStatus {
    /** new friend requests will automatically be pending */
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    CANCELED = "canceled",
}

export interface FriendshipRequest {
    sender_id: number;
    first: string;
    last: string;
    image_url?: string;
    status: FriendshipStatus;
}

export interface ChatMessage {
    id: number;
    user_id: number;
    first: string;
    last: string;
    image_url?: string;
    message: string;
    timestamp: string;
}
