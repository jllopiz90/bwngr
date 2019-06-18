"use strict";

const path = require('path');

const internal = {};
module.exports = internal.User = class {
    handleRoute(route, params){
        const filePath = path.join(process.cwd(), 'routing/public', route);
        const usersEndpoint = require(filePath);
        return usersEndpoint.execute(params);
    }
}