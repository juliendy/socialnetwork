import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ReduxStore } from "../redux/reducers";
import { FriendshipStatus } from "../types";
import { User } from "../types";
import userProfile from "./user-profile";

interface FriendshipButtonProps {
    /** id of the profile the user is viewing  [I'm a typescript doc comment. if you hover over profile Id somewhere else in this document, this comment will be shown as info]*/
    profileId: string;
}

export default function (props: FriendshipButtonProps) {
    const [friendshipStatus, setFriendshipStatus] = useState<
        FriendshipStatus | undefined
    >(undefined);

    const [recipientId, setRecipientId] = useState<number | undefined>(
        undefined
    );
    const [senderId, setSenderId] = useState<number | undefined>(undefined);

    const user = useSelector((state: ReduxStore) => state.user);

    useEffect(() => {
        if (!props.profileId) {
            return;
        }
        // in case user navigates away from page, while request is being processed, this keeps it from throwing an error
        let abort = false;
        (async () => {
            fetch(`/api/friendship-requests/${props.profileId}`)
                .then((res) => {
                    if (res.status !== 200) {
                        console.log(res.status);
                        throw new Error(
                            "Sorry, we couldn't find the friendship status."
                        );
                    }
                    return res.json();
                })
                .then((data) => {
                    if (!abort) {
                        setFriendshipStatus(data.status);
                        setRecipientId(data.recipient_id);
                        setSenderId(data.sender_id);
                    }
                })
                .catch((err) => {
                    console.log(err, "error with finding user profile");
                });
        })();
        return () => {
            abort = true;
        };
    }, [props.profileId]);

    const createFriendshipStatus = () => {
        fetch(`/api/friendship-requests`, {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                recipient_id: props.profileId,
            }),
        }).then(() => {
            console.log("updating button")
            setFriendshipStatus(FriendshipStatus.PENDING);
        });
    };

    const updateFriendshipStatus = (status: FriendshipStatus) => {
        fetch(`/api/friendship-requests/${props.profileId}`, {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status }),
        }).then(() => {
            setFriendshipStatus(status);
        });
    };

    if (friendshipStatus === FriendshipStatus.ACCEPTED) {
        return (
            <button
                className="friend-button"
                onClick={() =>
                    updateFriendshipStatus(FriendshipStatus.CANCELED)
                }
            >
                Unfriend
            </button>
        );
    }
    if (friendshipStatus === FriendshipStatus.PENDING && user.id === senderId) {
        return (
            <button
                className="friend-button"
                onClick={() =>
                    updateFriendshipStatus(FriendshipStatus.CANCELED)
                }
            >
                Cancel Request
            </button>
        );
    }

    if (
        friendshipStatus === FriendshipStatus.PENDING &&
        user.id === recipientId
    ) {
        return (
            <button
                className="friend-button"
                onClick={() =>
                    updateFriendshipStatus(FriendshipStatus.ACCEPTED)
                }
            >
                Accept
            </button>
        );
    }
    return (
        <button className="friend-button" onClick={createFriendshipStatus}>
            Send Friend Request
        </button>
    );
}
