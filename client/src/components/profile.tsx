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
                <ProfilePic user={user} />

                <BioEditor />
            </div>
            <p>Hello {user.first}! Today's good day to be you!</p>
            <div>
                <FriendshipRequests />
            </div>
        </>
    );
}
