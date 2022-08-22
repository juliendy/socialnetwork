import React, { useState, useEffect } from "react";
import { User } from "../types";
import ProfilePic from "../components/profile-pic";
import { useParams } from "react-router";
import FriendshipButton from "../components/friendship-button";

export default function () {
    const { id } = useParams<{ id: string }>();
    // our user state is gonna be undefined before we fetch data
    const [userState, setUserState] = useState<User | undefined>(undefined);

    useEffect(() => {
        if (!id) {
            return;
        }
        let abort = false;
        (async () => {
            fetch(`/api/users/${id}`)
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error("Sorry, we couldn't finde the user.");
                    }
                    return res.json();
                })
                .then((data) => {
                    if (!abort) {
                        setUserState(data.user);
                    }
                })
                .catch((err) => {
                    console.log(err, "error with finding user profile");
                });
        })();
        return () => {
            abort = true;
        };
    }, [id]);
    if (!userState) {
        return null;
    }
    return (
        <>
            <div className="profile">
                <div>
                    {/* for profile pic we can't use the general user, aka the person logged in, because we are also showing other people's pictures */}
                    <ProfilePic user={userState} />
                    <FriendshipButton profileId={id} />
                </div>
                <div className="user-info">
                    <h3>
                        {userState.first} {userState.last}
                    </h3>
                    <h4>{userState.bio}</h4>
                </div>
            </div>
        </>
    );
}
