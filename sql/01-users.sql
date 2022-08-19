DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reset_codes;
DROP TABLE IF EXISTS friendships;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    --  unique so only one aacount with same email address exists
    email VARCHAR UNIQUE NOT NULL CHECK (email != ''),
    password_hash VARCHAR NOT NULL CHECK(password_hash != ''),
    image_url VARCHAR ,
    bio VARCHAR,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reset_codes(
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL,
    code VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE friendships(
    sender_id INT NOT NULL  REFERENCES users(id),
    recipient_id INT NOT NULL  REFERENCES users(id),
    status VARCHAR NOT NULL DEFAULT 'pending',
    -- combo of sender and recipient is unique enough that there can only be one AND we can make more and receive more than one friend request :P
    PRIMARY KEY (sender_id, recipient_id)
  );

CREATE TABLE chat_messages(
    id SERIAL PRIMARY KEY,
    user_id  INT NOT NULL  REFERENCES users(id),
    message VARCHAR NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);