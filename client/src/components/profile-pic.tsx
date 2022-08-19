import React from "react";
import { User } from "../types";

interface ProfilePicProps {
    user: User;
    // optional property; this function is not going to return anything
    onClick?: () => void;
}
const defaultProfilePic =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMgMjRoLTdjLTIuNTY0LTMuNDgzLTUtOS43ODItNS0xNmgxN2MwIDYuMTY3LTIuNSAxMi42MjUtNSAxNnptNi4wODgtMTRjLS4wNTEuNjg4LS4xMTUgMS4zNTYtLjE5MiAyaDEuNzA3Yy0uMzIxIDEuNjM1LTEuNDYzIDMuMzMxLTIuNzU2IDQuNjc3LS4zNTggMS4yODMtLjc3MiAyLjQzOS0xLjE1MyAzLjIyOSAzLjE1My0xLjQ1MyA1Ljk4Ny02LjM4OSA2LjMwNi05LjkwNmgtMy45MTJ6bS04LjQ5LTMuMDAxYzEuNTItLjM1MiAyLjU1NS0xLjI3NiAyLjQ2Ni0yLjM5OS0uMTE3LTEuNDg1LTMuMTM0LTIuNzE4LTIuMzItNC42LTQuNzM1IDMuODE3IDEuNzY0IDMuOTAyLS4xNDYgNi45OTl6bS0zLjIwNy4wMDFjMS41MjMtLjI5IDEuODMyLTEuMDY3IDEuODMyLTEuNTMzIDAtMS4wNDUtMi4yNzktMi4wMDItMS41MjgtMy43OTUtMy42NDggMy4wOTQuOTk1IDMuMDg4LS4zMDQgNS4zMjh6Ii8+PC9zdmc+";
const ProfilePic = (props: ProfilePicProps) => {
    return (
        <img
            src={props.user.image_url || defaultProfilePic}
            alt={`${props.user.first} ${props.user.last}`}
            className="profile-pic"
            onClick={props.onClick}
        />
    );
};

export default ProfilePic;
