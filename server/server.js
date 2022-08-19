const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const aws = require("aws-sdk");
const cryptoRandomString = require("crypto-random-string");
const { uploader } = require("./middleware");
const s3 = require("./s3");
const cookieSession = require("cookie-session");
const db = require("./db");
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});

app.use(compression());

let COOKIE_SECRET;
if (process.env.NODE_ENV == "production") {
    COOKIE_SECRET = process.env; // in prod the secrets are environment variables
} else {
    COOKIE_SECRET = require("../secrets.json").COOKIE_SECRET; // in dev they are in secrets.json which is listed in .gitignore
}

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("../secrets.json");
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "eu-west-1", // Make sure this corresponds to the region in which you have verified your email address (or 'eu-west-1' if you are using the Spiced credentials)
});

const cookieSessionMiddleware = cookieSession({
    //random string input for secret; the longer the better(normally shouldnt be in a public place like github)
    secret: COOKIE_SECRET,
    //milliseconds times seconds times minutes times hours times days => two weeks in milliseconds
    maxAge: 1000 * 60 * 60 * 24 * 14,
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "client", "public")));

// to think about and maybe change:
// REST API convention, i.e CRUD create read update delete

// GET /api/users
// GET /api/users?search=balu
// GET /api/users?sort=recent&limit=3

// GET /api/users/:id - get a single user
// GET /api/users/:id/friends - get the friends (users) of a specific user
// GET /api/users/:id/photos - get the photos resources of a specific user

// POST /api/users - create new user ie register
// PATCH /api/users/:id - partially update user info, ie bio/password
// --------------------------------------------------------------------------------profile & finding people-----------------------------------------------------

app.get("/api/users", function (req, res) {
    if (!req.session.userId) {
        res.status(401).json({ type: "unauthorized" });
        return;
    }

    // if no limit is given, default limit is 10
    const { search, limit = 10, sort } = req.query;

    // since all queries return users, are followed by the same then and catch
    //  and since only one of our 3 queries will be executed, we can put them into a variable
    let dbQueryPromise;

    if (sort === "recent") {
        dbQueryPromise = db.getRecentUsers(limit, req.session.userId);
    } else if (search) {
        // search DB
        dbQueryPromise = db.getUsersByNameQuery(search);
    } else {
        // return users if request doesnt filter , we can return all
        dbQueryPromise = db.getUsers(limit);
    }
    // after our conditionals we have figured out which query will be assigned to our variable and we wait for it to resolve
    dbQueryPromise
        .then((users) => {
            res.json({
                users,
            });
        })
        .catch((err) => {
            console.log(err, "User info couldn't be retrieved.");
            res.status(500).json({
                message: "Sorry, there was an error. We are working on it.",
            });
        });
});

app.get("/api/users/me", function (req, res) {
    if (!req.session.userId) {
        res.json({
            isLoggedIn: false,
        });
        return;
    }
    db.getUserById(req.session.userId)
        .then((user) => {
            res.json({
                isLoggedIn: true,
                user,
            });
        })
        .catch((err) => {
            console.log(err, "User info couldn't be retrieved.");
            res.json({
                isLoggedIn: false,
            });
        });
});

app.get("/api/users/:id", function (req, res) {
    if (!req.session.userId) {
        res.status(401).json({ type: "unauthorized" });
        return;
    }
    db.getUserById(req.params.id)
        .then((user) => {
            res.json({
                user,
            });
        })
        .catch((err) => {
            console.log(err, "User info couldn't be retrieved.");

            res.status(500).json({
                message: "Sorry, there was an error. We are working on it.",
            });
        });
});
//--------------------------------------------------------------------------------------Login & Registration------------------------------------------------------------------

app.post("/api/register", (req, res) => {
    if (typeof req.session.userId !== "undefined") {
        res.status(400).json({
            success: false,
            error: "User is already logged in. Please log out to register a new account.",
        });
        return;
    }
    const { firstName, lastName, email, password } = req.body;

    // insert new user into db
    db.addUser(firstName, lastName, email, password)
        .then((user) => {
            req.session.userId = user.id;
            res.json({ success: true });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        });
});

app.post("/api/reset-password", (req, res) => {
    const { email } = req.body;
    const secretCode = cryptoRandomString({
        length: 6,
    });
    db.verifyUserByEmail(email)
        .then((email) => {
            return db.addCodeToUser(email, secretCode);
        })
        .then(() => {
            return ses
                .sendEmail({
                    Source: "Instrumentalist <happy.skater@spicedling.email>",
                    Destination: {
                        ToAddresses: ["happy.skater@spicedling.email"],
                    },
                    Message: {
                        Body: {
                            Text: {
                                Data: `Please enter this code ${secretCode} on our webpage!`,
                            },
                        },
                        Subject: {
                            Data: "Reset Password",
                        },
                    },
                })
                .promise();
        })
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        });
});

app.post("/api/secret-code", (req, res) => {
    const { code, password } = req.body;

    db.getEmailByResetCode(code)
        .then((email) => {
            return db.updatePasswordByEmail(password, email);
        })
        .then(() => {
            res.json({
                success: true,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        });
});

app.post("/api/login", (req, res) => {
    if (typeof req.session.userId !== "undefined") {
        res.status(400).json({
            success: false,
            error: "User is already logged in. Please log out to register a new account.",
        });
        return;
    }
    const { email, password } = req.body;

    db.verifyUser(email, password)
        .then((userInfo) => {
            req.session.userId = userInfo.id;
            res.json({ success: true });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        });
});

app.post(
    "/api/users/upload",
    uploader.single("image"),
    s3.upload,
    (req, res) => {
        if (req.file) {
            const newImageUrl = path.join(
                "https://s3.amazonaws.com/spicedling",
                `${req.file.filename}`
            );

            db.updateImage(req.session.userId, newImageUrl).then(() => {
                console.log(": ");
                res.json({
                    url: newImageUrl,
                });
            });
        }
    }
);

app.post("/api/users/bio", (req, res) => {
    db.updateBio(req.session.userId, req.body.bio).then(() => {
        res.json({
            bio: req.body.bio,
        });
    });
});
// -------------------------------------------------------------friendship button----------------------------------------------------

app.get("/api/friendship-requests/:otherId", (req, res) => {
    if (!req.session.userId) {
        res.status(401).json({ type: "unauthorized" });
        return;
    }
    db.checkFriendStatus(req.session.userId, req.params.otherId)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.log(err, "User info couldn't be retrieved.");

            // res.status(404).json();
            res.json({ status: undefined });
        });
});

app.get("/api/users/me/friendship-requests", function (req, res) {
    if (!req.session.userId) {
        res.status(401).json({ type: "unauthorized" });
        return;
    }
    db.getPendingFriendRequests(req.session.userId)
        .then((requests) => {
            res.json({ requests });
        })
        .catch((err) => {
            console.log(err, "Friend requests couldn't be retrieved.");

            res.status(404).json();
        });
});

app.post("/api/friendship-requests/:otherId", (req, res) => {
    return db
        .updateFriendshipRequest(
            req.session.userId,
            req.params.otherId,
            req.body.status
        )
        .then((data) => {
            res.json(data);
            console.log(data);
        })
        .catch((err) => {
            console.log("the friend request couldn't get updated", err);
            res.status(500).json();
        });
});

app.post("/api/friendship-requests", (req, res) => {
    return db
        .createFriendshipRequest(req.session.userId, req.body.recipient_id)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.log("the friend request couldn't get created", err);
            res.status(500).json();
        });
});

app.get("/api/users/me/friends", (req, res) => {
    if (!req.session.userId) {
        res.status(401).json({ type: "unauthorized" });
        return;
    }
    return db
        .getFriends(req.session.userId)
        .then((friends) => {
            res.json({ friends });
        })
        .catch((err) => {
            console.log(err, "Friends  couldn't be retrieved.");

            res.status(404).json();
        });
});

app.get("/log-out", (req, res) => {
    req.session = null;
    return res.redirect("/login");
});


app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

// _------------------------------------------------Socket Server------------------------------------

io.on("connection", function (socket) {
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }
    const userId = socket.request.session.userId;
    //  event name, array of objects
    db.getChatMessages().then((messages) => {
        socket.emit("last-10-messages", messages);
    });

    socket.on("new-message", (message) => {
        console.log("new-message", message);

        // then()returns row of my chat_messages table
        db.addChatMessages(userId, message)
            .then((row) => {
                return db.getMessageById(row.id);
            })
            .then((entireMessageData) => {
                io.emit("add-new-message", entireMessageData);
            });
    });
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
