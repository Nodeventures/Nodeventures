"use strict";

var q = require('q');
var encryption = require('./utils/encryption');
var User = require('./models/User');

function registerUser(userInfo, defer) {
    // userInfo - username, password
    var newUserInfo = {};
    newUserInfo.username = userInfo.username;
    newUserInfo.salt = encryption.generateSalt();
    newUserInfo.hashPassword = encryption.generateHashedPassword(newUserInfo.salt, userInfo.password);

    User.create(newUserInfo, function (err, user) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve({username: user.username});
        }
    });
}

function checkUserLogin(foundUser, userPassword, defer) {
    if (foundUser.isAuthenticated(userPassword)) {
        defer.resolve({username: foundUser.username});
    } else {
        defer.reject({message: 'Invalid password. Please try again.'});
    }
}

module.exports = {
    registerUser: function (userInfo) {
        // userInfo - username, password
        var defer = q.defer();
        var username = userInfo.username;

        // If there is a user with the given username, then the user is trying to login, and we check password for correctness.
        // If there is no such user, then we create new one.
        this.findByUsername(username)
            .then(function (user) {
                if (!user) {
                    registerUser(userInfo, defer);
                } else {
                    checkUserLogin(user, userInfo.password, defer);
                }
            })
            .fail(function (err) {
                defer.reject(err);
            });

        return defer.promise;
    },
    findByUsername: function (username) {
        var defer = q.defer();

        if (username) {
            User.findOne()
                .where('username').equals(username)
                .exec(function (err, user) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        defer.resolve(user);
                    }
                });
        } else {
            defer.reject({message: 'You should provide username.'});
        }

        return defer.promise;
    },

    // TODO
    setHeroStatus: function(status, eventData) {
        // eventdata: username, hero_id
        
        var defer = q.defer();
        defer.resolve();
        return defer.promise;
    }
};