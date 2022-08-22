import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { ReduxStore } from "../redux/reducers";
import { Link } from "react-router-dom";
import { socket } from "./socket";

const formatTimestamp = (timestamp: string) => {
    let d = new Date(timestamp);
    return d.toLocaleString();
};

export default function () {
    // ----------------------------------------------------------------------------chat variables
    const messages = useSelector((state: ReduxStore) => state.chat);

    // ----------------------------------------------chatInput variables
    const textareaRef = useRef<HTMLTextAreaElement>();
    const chatHistoryRef = useRef<HTMLDivElement>();

    const sendMessage = () => {
        if (textareaRef.current) {
            const message = textareaRef.current.value;
            socket.emit("new-message", message);
            // current references to the cureent DOM node textareaRef is linked to(siehe untem im dokument)
            textareaRef.current.value = "";
            textareaRef.current.focus();
        }
    };

    const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            sendMessage();
        }
    };

    // anytime a new message/chat comment is received, our chat history automaitcally scrolls down to the most current post
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop =
                chatHistoryRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat">
            <h2>Ki-Ki with other users!</h2>
            <div className="chat-wrapper">
                <div className="chat-history" ref={chatHistoryRef}>
                    {messages.map((message) => {
                        return (
                            <div key={message.id} className="chat-item">
                                <div>
                                    <img
                                        className="chat-pic"
                                        src={message.image_url}
                                        alt="picture of user sending friend message"
                                    />
                                </div>
                                <div className="chat-body">
                                    <Link
                                        to={`/users/${message.user_id}`}
                                        className=" chat-message "
                                    >
                                        {message.first} {message.last}
                                    </Link>
                                    <p>{message.message}</p>
                                    <p className="timestamp">
                                        {formatTimestamp(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* linking the variable textareaRef to this specific html element, i.e. <textarea> */}
                <div className="chat-comment">
                    <textarea
                        ref={textareaRef}
                        onKeyUp={onKeyPress}
                        rows={2}
                    ></textarea>
                    <button className="chat-post"onClick={sendMessage}> Post</button>
                </div>
            </div>
        </div>
    );
}
