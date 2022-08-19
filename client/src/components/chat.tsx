import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { ReduxStore } from "../redux/reducers";
import { Link } from "react-router-dom";
import { socket } from "./socket";

export default function () {
    // ----------------------------------------------------------------------------chat variables
    const messages = useSelector((state: ReduxStore) => state.chat);

    // ----------------------------------------------chatInput variables
    const textareaRef = useRef<HTMLTextAreaElement>();
    const sendMessage = () => {
        if (textareaRef.current) {
            const message = textareaRef.current.value;
            socket.emit("new-message", message);
            // current references to the cureent DOM node textareaRef is linked to
            textareaRef.current.value = "";
            textareaRef.current.focus();
        }
    };

    const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            sendMessage();
        }
    };

    return (
        <div>
            <h1>BS wall</h1>
            <div>
                {messages.map((message) => {
                    return (
                        <div key={message.id}>
                            <img
                                src={message.image_url}
                                alt="picture of user sending friend message"
                            />

                            <div>
                                <Link
                                    to={`/users/${message.user_id}`}
                                    className="users-list-item"
                                >
                                    {message.first} {message.last} on{" "}
                                    {message.timestamp
                                        .slice(0, 10)
                                        .split("-")
                                        .reverse()
                                        .join("-")}{" "}
                                    @{message.timestamp.slice(11, 19)}
                                </Link>
                                <p>{message.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* linking the variable textareaRef to this specific html element, i.e. <textarea> */}
            <textarea ref={textareaRef} onKeyUp={onKeyPress}></textarea>
        </div>
    );
}