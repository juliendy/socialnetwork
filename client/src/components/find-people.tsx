import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Link } from "react-router-dom";

export default function () {
    // <User[]> tells me our state is an array of user objects(thank you typescirpt)
    const [recentUserState, setRecentUserState] = useState<User[]>([]);
    const [searchState, setSearchState] = useState("");
    const [searchedUserState, setSearchedUserState] = useState<User[]>([]);

    useEffect(() => {
        fetch("/api/users?sort=recent&limit=6")
            .then((res) => {
                if (res.status !== 200) {
                    throw new Error("Sorry, we couldn't finde the users.");
                }
                return res.json();
            })
            .then((data) => {
                // data.users is our array
                setRecentUserState(data.users);
            })
            .catch((err) => {
                console.log(err, "error with finding recent users");
            });
    }, []);

    useEffect(() => {
        if (!searchState) {
            return;
        }
        let abort = false;
        (async () => {
            fetch(`/api/users?search=${searchState}`)
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error("Sorry, we couldn't finde the users.");
                    }
                    return res.json();
                })
                .then((data) => {
                    // data.users is our array
                    if (!abort) {
                        setSearchedUserState(data.users);
                    }
                })
                .catch((err) => {
                    console.log(err, "error with finding recent users");
                });
        })();
        return () => {
            abort = true;
        };
    }, [searchState]);

    return (
        <div className="find-people">
            <div className="recent-users">
                <h1>Recent queens</h1>
                <p>
                    Checkout new queens and start ki-ki-ing!
                </p>
                <div className="users-list">
                    {recentUserState.map((user) => {
                        return (
                            <Link
                                to={`/users/${user.id}`}
                                className="users-list-item"
                                key={user.id}
                            >
                                <img
                                    className="profile-pic"
                                    src={user.image_url}
                                    alt="profile picture"
                                />
                                <p>
                                    {user.first} {user.last}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="search-users">
                <h1>Queen-search: </h1>

                <input
                    type="text"
                    placeholder="Enter a name"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                />
                <div className="users-list">
                    {searchedUserState.map((user) => {
                        return (
                            <Link
                                to={`/users/${user.id}`}
                                className="users-list-item"
                                key={user.id}
                            >
                                <img
                                    className="search-pic"
                                    src={user.image_url}
                                    alt="profile picture"
                                />
                                <h3>
                                    {user.first} {user.last}
                                </h3>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
