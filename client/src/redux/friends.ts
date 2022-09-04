import { User } from "../types";

interface GetFriendsAction {
    type: "friends/get-friends";
    payload: {
        friends: User[];
    };
}

type FriendsAction = GetFriendsAction;
// the array will consist of the same key:value pairs as our User type AND it will be an empty array intitially;
// typescript: function signature , i.e. the :type after the parentheses, defines what's being returned !important
export default function friendsReducer(
    friends: User[] = [],
    action: FriendsAction
): User[] {
    if (action.type === "friends/get-friends") {
        return action.payload.friends;
    }

    return friends;
}

export function getFriendsHelper(friends: User[]): GetFriendsAction {
    return {
        type: "friends/get-friends",
        payload: { friends },
    };
}

