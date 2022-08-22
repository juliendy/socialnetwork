import React from "react";
import { User } from "../types";
import ProfilePic from "../components/profile-pic";
import FriendshipRequests from "../components/friendship-requests";

import BioEditor from "../components/bio-editor";
import { useSelector } from "react-redux";
import { ReduxStore } from "../redux/reducers";

export default function () {
    const user = useSelector((state: ReduxStore) => state.user);
    return (
        <>
            <div className="profile">
                <p id="greeting-user">Glad to have you back, {user.first}! 🎉</p>
                <ProfilePic user={user} />

                <BioEditor />
            </div>
            <div>
                <FriendshipRequests />
            </div>
        </>
    );
}
