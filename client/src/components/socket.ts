import { io, Socket } from "socket.io-client";
import { messagesReceived, messageReceived } from "../redux/chat";
import { ChatMessage } from "../types";
import { Store } from "redux";

export let socket: Socket;

export const init = (store: Store) => {
    if (!socket) {
        // @ts-ignore
        socket = io.connect();

        socket.on("last-10-messages", (messages: ChatMessage[]) => {
            // messages should be an array
            console.log("got last 10 messages:", messages);

            store.dispatch(messagesReceived(messages));
        });

        socket.on("add-new-message", (message: ChatMessage) => {
            store.dispatch(messageReceived(message));
        });
    }
};
