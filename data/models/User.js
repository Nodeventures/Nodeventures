"use strict";

var mongoose = require('mongoose');
var encryption = require('../utils/encryption');

var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    salt: String,
    hashPassword: String
});

userSchema.methods.isAuthenticated = function (password) {
    // check if the given password for login is the same as the password which the user used to register
    return (encryption.generateHashedPassword(this.salt, password) === this.hashPassword);
};

var User = mongoose.model('User', userSchema);

module.exports = User;