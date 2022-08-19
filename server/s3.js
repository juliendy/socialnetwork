const aws = require("aws-sdk");
const fs = require("fs");
// , since we use this in multiple places, I only need to change this variable if I change the bucket value
const S3_BUCKET = "spicedling";
exports.S3_BUCKET = S3_BUCKET;

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("../secrets.json"); // in dev they are in secrets.json which is listed in .gitignore
}
// aws expects these key names
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }

    const { filename, mimetype, size, path } = req.file;

    // 's3 represents our user'
    s3.putObject({
        // bucket name needs to be changed in case I open my own aws account- own bucket
        Bucket: S3_BUCKET,
        ACL: "public-read",
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size,
    })
        .promise()
        .then((data) => {
            // it worked!!!
            console.log("amazon upload successful", data);
            next();
            // will delete the image we just uploaded from the uploads folder
            fs.unlink(path, () => {});
        })
        .catch((err) => {
            // uh oh
            console.log("err in upload put object in S3.js", err);
            res.sendStatus(404);
        });
};
