import { ChatMessage } from "../types";

export default function messagesReducer(
    messages: ChatMessage[] = [],
    action: any
): ChatMessage[] {
    switch (action.type) {
        case "/messages/received":
            console.log("/messages/received", action);
            return action.payload;

        case "/message/received":
            return [...messages, action.payload];

        default:
            return messages;
    }
}

export function messagesReceived(messages: ChatMessage[] = []) {
    return {
        type: "/messages/received",
        payload: messages,
    };
}

export function messageReceived(message: ChatMessage) {
    return {
        type: "/message/received",
        payload: message,
    };
}
