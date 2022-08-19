const multer = require("multer");
const path = require("path");
const uidSafe = require("uid-safe");
//  different ways to work with multer, we'll use this one, storing on a disk
// tell multer where to store the file and how to name it, so we don't want run into issues when users  the
//  upload files with same name
// we can use UID(unique identifier)
const storage = multer.diskStorage({
    // destination as a function or , if it's always the same place- as a string
    destination: path.join(__dirname, "uploads"),

    filename: (req, file, callback) => {
        // specify how long the generated uid should be, i.e. 24
        uidSafe(24).then((uid) => {
            const extension = path.extname(file.originalname);
            // is this correct?

            const newFilename = uid + extension;
            // null because we don't have an error, which should be passed first in a callback
            callback(null, newFilename);
        });
    },
});

module.exports.uploader = multer({
    storage,
    limits: {
        fileSize: 2097152,
    },
});
