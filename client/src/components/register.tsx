// {useState} is importing a hook
import React, { useState } from "react";
import FormField from "./form-field";
import { Link } from "react-router-dom";

const Register = () => {
    // we call the useState hook and provide an empty string as the initial state value. The hook gives us an array- the first item is our state value,
    // the second item is a function that allows us to update our state value
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ firstName, lastName, email, password });
        fetch("/api/register", {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // browser window function that refreshes the page
                    location.reload();
                    return;
                }
                setError(
                    "Unable to create account. Please try again!"
                );
            });
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <h3>Whatcha waiting for?! Fill deets below!</h3>
            {error && <p className="form-error">{error}</p>}
            <FormField
                name="firstName"
                type="text"
                id="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <FormField
                name="lastName"
                type="text"
                id="lastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <FormField
                name="email"
                type="email"
                id="email"
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
                name="password"
                type="password"
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div className="form-field">
                <input type="submit" value="Join!"></input>
            </div>
            <p>
                Already a member? Guurl... <Link to="/login"> Log in!</Link>
            </p>
        </form>
    );
};

export default Register;
