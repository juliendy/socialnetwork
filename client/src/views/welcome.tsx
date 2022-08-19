import React from "react";
import Register from "../components/register";
import Login from "../components/login";
import ResetPassword from "../components/reset-password";
import { BrowserRouter, Route } from "react-router-dom";

const Welcome = () => {
    return (
        <>
            <div className="welcome">
                <h1>Welcome to</h1>
                <h1 className="logo">the Social Media</h1>
                <h3>
                    Where nothing really happens tbh
                </h3>
            </div>
            <BrowserRouter>
                <Route exact path="/">
                    <Register />
                </Route>
                <Route path="/login">
                    <Login />
                </Route>
                <Route path="/reset-password">
                    <ResetPassword />
                </Route>
            </BrowserRouter>
        </>
    );
};

export default Welcome;
