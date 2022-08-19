import React, { useState } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import ProfilePic from "../components/profile-pic";
import Profile from "../components/profile";
import Uploader from "../components/uploader";
import { User } from "../types";
import FindPeople from "../components/find-people";
import UserProfile from "../components/user-profile";
import { useSelector } from "react-redux";
import { ReduxStore } from "../redux/reducers";
import Friends from "../components/friends";
import Chat from "../components/chat";

const Account = () => {
    const user = useSelector((state: ReduxStore) => state.user);

    const [uploaderIsVisible, setUploaderIsVisible] = useState(false);
    return (
        <>
            <BrowserRouter>
                <header>
                    <div className="container">
                        <div className="header-wrapper">
                            <h1 className="logo">The social media</h1>
                            <div>
                                <Link className="header-link" to="/">
                                    Home
                                </Link>

                                <Link className="header-link" to="/users">
                                    Find people
                                </Link>

                                <Link className="header-link" to="/friends">
                                    Friends
                                </Link>
                                <Link className="header-link" to="/chat">
                                    Klat-klatsch
                                </Link>
                            </div>
                            {/* for profile pic we can't use the general user, aka the person logged in, because we are also showing other people's pictures */}
                            <ProfilePic
                                user={user}
                                // if PP clicked, uploader toggled to show
                                onClick={() => setUploaderIsVisible(true)}
                            />
                        </div>
                    </div>
                </header>
                <div className="container">
                    <Route exact path="/">
                        <Profile />
                    </Route>

                    <Route exact path="/users">
                        <FindPeople />
                    </Route>
                    <Route path="/users/:id">
                        <UserProfile />
                    </Route>

                    <Route path="/friends">
                        <Friends />
                    </Route>
                    <Route path="/chat">
                        <Chat />
                    </Route>
                </div>
            </BrowserRouter>
            {/* is state uploaderIsVisible is true, uploader will render */}
            {uploaderIsVisible && (
                <Uploader onClose={() => setUploaderIsVisible(false)} />
            )}
        </>
    );
};

export default Account;
