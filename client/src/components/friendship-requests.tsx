import React, { useState, useEffect } from "react";
import { FriendshipRequest, FriendshipStatus, User } from "../types";
import { Link } from "react-router-dom";
interface FrProps {}

export default function (props: FrProps) {
    const [friendshipRequests, setFriendshipRequests] = useState<
        FriendshipRequest[]
    >([]);

    useEffect(() => {
        let abort = false;
        (async () => {
            fetch(`/api/users/me/friendship-requests`)
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(
                            "Sorry, we couldn't find the friendship status."
                        );
                    }
                    return res.json();
                })
                // an object of request arrays
                .then((data) => {
                    if (!abort) {
                        setFriendshipRequests(data.requests);
                    }
                })
                .catch((err) => {
                    console.log(err, "error with finding user profile");
                });
        })();
        return () => {
            abort = true;
        };
    }, []);

    const updateFriendshipStatus = (
        status: FriendshipStatus,
        sender_id: number
    ) => {
        fetch(`/api/friendship-requests/${sender_id}`, {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status }),
        }).then((res) => {
            if (res.status === 200) {
                setFriendshipRequests((requests) =>
                    // removes the request we accepted or declined from my requests array, i.e. it doesn't show up on the page anymore
                    requests.filter((r) => r.sender_id !== sender_id)
                );
            }
        });
    };
    if (!friendshipRequests.length) {
        return null;
    }
    return (
        <div>
            <h3>Pending requests: </h3>
            <div className="friendship-requests">
                {friendshipRequests.map((request) => {
                    return (
                        <div
                            className="friendship-request-item"
                            key={request.sender_id}
                        >
                            <Link
                                to={`/users/${request.sender_id}`}
                                // key just needs to be unique locally in the mapped array, so sender_id in this case is ok
                                key={request.sender_id}
                            >
                                <img
                                    className="profile-pic"
                                    src={request.image_url}
                                    alt="profile picture"
                                />
                                <p>
                                    {request.first} {request.last}
                                </p>
                            </Link>
                            <button
                                className="friend-button"
                                onClick={() =>
                                    updateFriendshipStatus(
                                        FriendshipStatus.ACCEPTED,
                                        request.sender_id
                                    )
                                }
                            >
                                Yeah, go on
                            </button>

                            <button
                                className="friend-button"
                                onClick={() =>
                                    updateFriendshipStatus(
                                        FriendshipStatus.CANCELED,
                                        request.sender_id
                                    )
                                }
                            >
                                Nu-uh
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
