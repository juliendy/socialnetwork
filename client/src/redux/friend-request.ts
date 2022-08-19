import { FriendshipRequest } from "../types";

interface GetFriendRequestAction {
    type: "friends/get-friend-request";
    payload: {
        requests: FriendshipRequest[];
    };
}

type FriendsAction = GetFriendRequestAction;
// the array will consist of the same key:value pairs as our FriendshipRequest type AND it will be an empty array intitially;
// typescript: function signature , i.e. the :type after the parentheses, defines what's being returned
export default function friendRequestReducer(
    requests: FriendshipRequest[] = [],
    action: FriendsAction
): FriendshipRequest[] {
    if (action.type === "friends/get-friend-request") {
        return action.payload.requests;
    }

    return requests;
}

export function getFriendRequestHelper(
    requests: FriendshipRequest[]
): GetFriendRequestAction {
    return {
        type: "friends/get-friend-request",
        payload: { requests },
    };
}
