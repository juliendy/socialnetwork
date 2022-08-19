let databaseUrl;
if (process.env.NODE_ENV === "production") {
    databaseUrl = process.env.DATABASE_URL;
} else {
    const {
        DB_USER,
        DB_PASSWORD,
        DB_HOST,
        DB_PORT,
        DB_NAME,
    } = require("../secrets.json");
    databaseUrl = `postgres:${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const spicedPg = require("spiced-pg");
const db = spicedPg(databaseUrl);
const bcrypt = require("bcryptjs");

const hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};
// ------------------------------------------------------------------------add user& verification----------------------------------------------------------

module.exports.addUser = (first, last, email, password) => {
    return hash(password)
        .then((password_hash) => {
            return db.query(
                `INSERT INTO users(first, last, email, password_hash)
        VALUES ($1, $2, $3, $4) 
        RETURNING * `,
                [first, last, email, password_hash]
            );
        })
        .then((result) => {
            return result.rows[0];
        });
};

module.exports.verifyUser = (email, password) => {
    return db
        .query("SELECT * FROM users where email = $1", [email])
        .then((result) => {
            // will be true if there are nor rows
            if (!result.rows.length) {
                throw new Error(
                    "No user with this email exists. Please register!"
                );
            }
            return Promise.all([
                bcrypt.compare(password, result.rows[0].password_hash),
                // we have to return the user info, so we can access it in the next promise
                result.rows[0],
            ]);
        })
        .then(([isPasswordMatch, userInfo]) => {
            if (!isPasswordMatch) {
                throw new Error("Your password was incorrect.");
            }
            return userInfo;
        });
};

module.exports.verifyUserByEmail = (email) => {
    return db
        .query("SELECT * FROM users where email = $1", [email])
        .then((result) => {
            // will be true if there are nor rows
            if (!result.rows.length) {
                throw new Error(
                    "No user with this email exists. Please register!"
                );
            }
            return result.rows[0].email;
        });
};

module.exports.addCodeToUser = (email, code) => {
    return db.query(
        `INSERT INTO reset_codes(email,code)
        VALUES ($1, $2) 
        RETURNING * `,
        [email, code]
    );
};

module.exports.getEmailByResetCode = (code) => {
    return db
        .query(
            `SELECT email FROM reset_codes
    WHERE CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes'
    AND code = $1
     `,
            [code]
        )
        .then((result) => {
            // will be true if there are nor rows
            if (!result.rows.length) {
                throw new Error(
                    "Your code is invalid or expired!Please rquest a new code."
                );
            }
            return result.rows[0].email;
        });
};

module.exports.updatePasswordByEmail = (password, email) => {
    return hash(password).then((password_hash) => {
        return db.query(
            `UPDATE users
                SET password_hash= $1
                WHERE email=$2`,
            [password_hash, email]
        );
    });
};
// ---------------------------------------------------------------------------------find people---------------------------------------------------------
module.exports.getUserById = (id) => {
    return db
        .query(
            `
    SELECT id, first, last,email,image_url,bio FROM users
    WHERE id =$1 `,
            [id]
        )
        .then((result) => {
            if (!result.rows.length) {
                throw new Error(
                    "No user with this email exists. Please register!"
                );
            }
            return result.rows[0];
        });
};
module.exports.getUsers = (limit) => {
    return db
        .query(
            ` SELECT id, first, last,image_url,bio, email
         FROM users LIMIT $1`,
            [limit]
        )
        .then((result) => {
            return result.rows;
        });
};

module.exports.getRecentUsers = (limit, user_id) => {
    return db
        .query(
            `SELECT id, first, last,image_url,bio, email 
        FROM users
        WHERE id != $2
        ORDER BY id DESC LIMIT $1`,

            [limit, user_id]
        )
        .then((result) => {
            return result.rows;
        });
};

module.exports.getUsersByNameQuery = (val) => {
    return db
        .query(
            `SELECT id,first,last,image_url,bio, email
         FROM users 
         WHERE first ILIKE $1 
         OR last ILIKE $1 `,
            ["%" + val + "%"]
        )
        .then((result) => {
            return result.rows;
        });
};
// ----------------------------------------------------------------------------user info/profile----------------------------------------------------------------------

module.exports.updateImage = (userId, url) => {
    return db.query(
        `UPDATE users
                SET image_url = $1
                WHERE id=$2`,
        [url, userId]
    );
};

module.exports.updateBio = (userId, bio) => {
    return db.query(
        `UPDATE users
                SET bio = $1
                WHERE id=$2`,
        [bio, userId]
    );
};
// -----------------------------------------------------------------------------------friend requests--------------------------------------------------------------------------------------------------------

module.exports.checkFriendStatus = (sender_id, recipient_id) => {
    return db
        .query(
            `SELECT * FROM friendships
         WHERE( sender_id =$1 AND recipient_id=$2)
        OR(sender_id=$2 AND recipient_id=$1)`,
            [sender_id, recipient_id]
        )
        .then((result) => {
            if (!result.rows.length) {
                throw new Error("No friendship request exists yet");
            }
            console.log(result.rows);
            return result.rows[0];
        });
};

module.exports.createFriendshipRequest = (sender_id, recipient_id) => {
    return db
        .query(
            `INSERT INTO friendships(sender_id,recipient_id)
            Values($1,$2)
            ON CONFLICT (sender_id, recipient_id) DO
            UPDATE
             SET status = 'pending'
            Returning *`,
            [sender_id, recipient_id]
        )
        .then((result) => {
            return result.rows[0];
        });
};

module.exports.updateFriendshipRequest = (sender_id, recipient_id, status) => {
    return db
        .query(
            `UPDATE friendships
        SET status =$3
        WHERE(sender_id =$1 AND recipient_id=$2)
        OR(sender_id=$2 AND recipient_id=$1)
        RETURNING *`,

            [sender_id, recipient_id, status]
        )
        .then((result) => {
            return result.rows;
        });
};

module.exports.getFriends = (userId) => {
    return db
        .query(
            `
        SELECT id, first, last ,status, image_url 
        FROM users
        JOIN friendships
        ON (status = 'accepted' AND recipient_id = $1 AND users.id = friendships.sender_id)
        OR (status = 'accepted' AND sender_id = $1 AND users.id = friendships.recipient_id)
       `,
            [userId]
        )
        .then((result) => {
            return result.rows;
        });
};

module.exports.getPendingFriendRequests = (userId) => {
    return db
        .query(
            `SELECT f.sender_id,f.status,u.first,u.last,u.image_url
                FROM friendships f            
                JOIN users u
            ON sender_id= u.id
            WHERE recipient_id=$1
            AND status='pending'
        `,
            [userId]
        )
        .then((result) => {
            return result.rows;
        });
};

module.exports.getChatMessages = () => {
    return db
        .query(
            `SELECT chat_messages.id,chat_messages.message, chat_messages.timestamp,users.first,users.last, users.image_url, users.id AS user_id
        FROM chat_messages
        JOIN users
        ON user_id= users.id
        LIMIT 10`
        )
        .then((result) => {
            return result.rows;
        });
};

module.exports.addChatMessages = (userId, message) => {
    return db
        .query(
            `INSERT INTO chat_messages(user_id, message)
            Values($1,$2)
            Returning * `,
            [userId, message]
        )
        .then((result) => {
            return result.rows[0];
        });
};

module.exports.getMessageById = (messageId) => {
    return db
        .query(
            `SELECT chat_messages.id,chat_messages.message, chat_messages.timestamp,users.first,users.last, users.image_url, users.id AS user_id
        FROM chat_messages
        JOIN users
        ON user_id= users.id
       WHERE chat_messages.id =$1`,
            [messageId]
        )
        .then((result) => {
            if (!result.rows.length) {
                throw new Error("No message with this Id exists!");
            }
            return result.rows[0];
        });
};
