import React from "react";
import { useDispatch } from "react-redux";
import { updateProfilePicHelper } from "../redux/user";

interface UploaderProps {
    // this function is not going to return anything; onClose for cancel button as well as end of successful upload
    onClose: () => void;
}

const Uploader = (props: UploaderProps) => {
    const dispatch = useDispatch();
    const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e);

        if (e.target.files.length < 1) {
            alert("You must add a file!");
            return;
        }
        if (e.target.files[0].size > 2097152) {
            alert("File is too big!Must be less than 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append("image", e.target.files[0]);

        fetch("/api/users/upload", {
            method: "post",
            body: formData,
        })
            .then((result) => result.json())
            .then((data) => {
                dispatch(updateProfilePicHelper(data.url));

                props.onClose();
            });
    };
    return (
        <div className="modal">
            <div className="modal-wrapper">
                <h3>Do you want to change your image?</h3>
                <form className="form">
                    <input type="file" onChange={uploadFile} />
                </form>
                <button onClick={props.onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default Uploader;
