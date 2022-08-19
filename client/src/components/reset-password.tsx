import React, { useState } from "react";
import FormField from "./form-field";
import { Redirect } from "react-router-dom";
// An enum type is a special data type in Typescript that enables for a variable to be a set of predefined constants.
// we need 2 formtypes: 1 where user types email & 1 where user types code and password
enum FormType {
    EMAIL = "email",
    NEW_PASSWORD = "newPassword",
    SUCCESS = "success",
}
const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    // (Typescript hint in <>) our state is going to be our enum FormType, in () we specifiy
    //  which of the(in our case) 2 available formTypes should be shown first
    const [formType, setFormType] = useState<FormType>(FormType.EMAIL);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email });
        fetch("/api/reset-password", {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // if email belongs to an existing user, we render the formtype new password
                    setFormType(FormType.NEW_PASSWORD);
                    return;
                }
                setError("Sorry. we were unable to send to you an email :(");
            });
    };
    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        fetch("/api/secret-code", {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // if email belongs to an existing user, we render the formtype new password
                    setFormType(FormType.SUCCESS);
                    return;
                }
                setError(
                    "Sorry, your code was invalid or already expired. Please try again."
                );
                setFormType(FormType.EMAIL);
            });
    };
    if (formType === FormType.EMAIL) {
        return (
            <form className="form" onSubmit={handleEmailSubmit}>
                <h3>
                    Please enter the email address with which you registered.
                </h3>
                {error && <p className="form-error">{error}</p>}
                <FormField
                    name="email"
                    type="email"
                    id="email"
                    label="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="form-field">
                    <input type="submit" value="Submit"></input>
                </div>
            </form>
        );
    } else if (formType === FormType.NEW_PASSWORD) {
        return (
            <form className="form" onSubmit={handleCodeSubmit}>
                <h3>Reset Password</h3>
                <p>Please enter the code you received</p>
                {error && <p className="form-error">{error}</p>}
                <FormField
                    name="code"
                    type="text"
                    id="code"
                    label="Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <p>Please enter a new password</p>
                <FormField
                    name="password"
                    type="password"
                    id="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="form-field">
                    <input type="submit" value="Reset Password"></input>
                </div>
            </form>
        );
    } else {
        return (
            <Redirect
                push
                to={{
                    pathname: "/login",
                    search: "?msg=reset-success",
                }}
            />
        );
    }
};

export default ResetPassword;
