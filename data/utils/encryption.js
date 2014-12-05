"use strict";

var crypto = require('crypto');

module.exports = {
    // generating salt function for user password encryption
    generateSalt: function () {
        return crypto.randomBytes(128).toString('base64');
    },
    // using the generated salt for every user, this function generates user hashed password
    generateHashedPassword: function (salt, password) {
        var hmac = crypto.createHmac('sha1', salt);
        return hmac.update(password).digest('hex');
    }
};