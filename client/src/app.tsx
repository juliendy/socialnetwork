import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import * as immutableState from "redux-immutable-state-invariant";
import reducer from "./redux/reducers";
import Welcome from "./views/welcome";
import Account from "./views/account";
import { init } from "./components/socket"

// app will be a shell component which will contain our router and control which views are rendered

fetch("/api/users/me")
    .then((response) => response.json())
    .then((data) => {
        if (!data.isLoggedIn) {
            ReactDOM.render(<Welcome />, document.querySelector("#app"));
        } else {
            const store = createStore(
                reducer,
                // preloaded state with our already existing user object. This way we can just pass user as an argument in our userReducer, no need to handle undefined edge case
                { user: data.user },
                applyMiddleware(immutableState.default())
            );
            init(store);
            ReactDOM.render(
                <Provider store={store}>
                    <Account />
                </Provider>,
                document.querySelector("#app")
            );
        }
    });
