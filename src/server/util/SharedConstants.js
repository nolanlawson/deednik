// constants shared between the server and the client so I can define them just once
"use strict";

module.exports = {
    MIN_PASSWORD_LENGTH : 8,
    MAX_PASSWORD_LENGTH : 32,
    ERRORS : {
        LOGIN : {
            NO_USER : "User not found.",
            BAD_PASSWORD : "Password is incorrect."
        },
        SIGNUP : {
            USER_EXISTS : "User already exists."
        }
    }
};