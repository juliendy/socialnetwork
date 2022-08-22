import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { ReduxStore } from "../redux/reducers";
import { getFriendsHelper } from "../redux/friends";
import { getFriendRequestHelper } from "../redux/friend-request";
import { Link } from "react-router-dom";

export default function () {
    const dispatch = useDispatch();

    const friends = useSelector((state: ReduxStore) => {
        return state.friends;
    });

    const requests = useSelector((state: ReduxStore) => {
        return state.friendRequests;
    });

    const getFriends = () => {
        fetch("/api/users/me/friends")
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                dispatch(getFriendsHelper(data.friends));
            });
    };

    const getFriendRequests = () => {
        fetch("/api/users/me/friendship-requests")
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                dispatch(getFriendRequestHelper(data.requests));
            });
    };

    useEffect(() => {
        getFriends();
        getFriendRequests();
    }, []);
    return (
        <div>
            <h3>Sister-Requests: </h3>
            <div className="friends-wrapper">
                {requests.map((request) => {
                    return (
                        <div key={request.sender_id}>
                            <img
                                src={request.image_url}
                                alt="picture of user sending friend request"
                            />

                            <div>
                                <Link
                                    to={`/users/${request.sender_id}`}
                                    className="users-list-item"
                                >
                                    {request.first} {request.last}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            <h3>The Sisterhood: </h3>
            <div className="friends-wrapper">
                {friends.map((friend) => {
                    return (
                        <div key={friend.id}>
                            <img
                                src={friend.image_url}
                                alt="picture of user sending friend request"
                            />
                            <div>
                                <Link
                                    to={`/users/${friend.id}`}
                                    className="users-list-item"
                                >
                                    {friend.first} {friend.last}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
