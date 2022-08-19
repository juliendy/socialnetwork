import { combineReducers } from "redux";
import userReducer from "./user";
import friendsReducer from "./friends";
import { User } from "../types";
import friendRequestReducer from "./friend-request";
import messagesReducer from "./chat";


export interface ReduxStore {
    user: ReturnType<typeof userReducer>;
    friends: ReturnType<typeof friendsReducer>;
    friendRequests: ReturnType<typeof friendRequestReducer>;
    chat: ReturnType<typeof messagesReducer>;
}

const rootReducer = combineReducers({
    friendRequests: friendRequestReducer,
    friends: friendsReducer,
    user: userReducer,
    chat: messagesReducer,
});

export default rootReducer;
