import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxStore } from "../redux/reducers";
import { updateBioHelper } from "../redux/user";

export default function () {
    const dispatch = useDispatch();
    const user = useSelector((state: ReduxStore) => {
        return state.user;
    });

    const [bioState, setBioState] = useState("");
    const [editState, setEditState] = useState(false);

    const saveBio = () => {
        fetch("/api/users/bio", {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ bio: bioState }),
        }).then(() => {
            dispatch(updateBioHelper(bioState));
            setBioState("");
            setEditState(false);
        });
    };
    return (
        <div className="my-bio">
            <h3>
                Snatch the attention with a few words about yourself: {" "}
                <button
                    className="edit"
                    onClick={() => {
                        setEditState(true);
                    }}
                >
                    🖊
                </button>
            </h3>

            <p>{user.bio}</p>
            {editState && (
                <>
                    <textarea
                        id="textarea"
                        value={bioState}
                        onChange={(e) => setBioState(e.target.value)}
                    ></textarea>
                    <button onClick={saveBio} className="update-btn">
                        {/* if there is an existing bio  the button shows "update", otherwise "add bio" */}
                        {user.bio ? "Update" : "Add Bio"}
                    </button>
                </>
            )}
        </div>
    );
}
