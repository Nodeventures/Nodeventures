"use strict";

module.exports = {
    development: {
        db: 'mongodb://localhost/nodeventures-test',
        port: process.env.PORT || 8080
    },
    production: {
        db: 'mongodb://localhost/nodeventures',
        port: process.env.PORT || 8080
    }
};