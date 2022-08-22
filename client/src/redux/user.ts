import { User } from "../types";

// defines the type structure of the action object
interface UpdateBioAction {
    type: "user/update-bio";
    payload: {
        bio: string;
    };
}

interface UpdateProfilePicAction {
    type: "user/update-profile-pic";
    payload: {
        image_url: string;
    };
}

//  there will be several UserActions in our reducer; update Bio is gonna be one of them; only actions assigned here may be used in the reducer
type UserAction = UpdateBioAction | UpdateProfilePicAction;

export default function userReducer(
    user: User = null,
    action: UserAction
): User {
    if (action.type === "user/update-bio") {
        return { ...user, bio: action.payload.bio };
    }

    if (action.type === "user/update-profile-pic") {
        return { ...user, image_url: action.payload.image_url };
    }

    return user;
}

//// 'helper function  create the action object input  in a standardized way
export function updateBioHelper(bio: string): UpdateBioAction {
    return {
        type: "user/update-bio",
        payload: { bio },
    };
}

export function updateProfilePicHelper(
    image_url: string
): UpdateProfilePicAction {
    return {
        type: "user/update-profile-pic",
        payload: { image_url },
    };
}
