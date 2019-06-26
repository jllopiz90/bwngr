"use strict";

const path = require('path');

const internal = {};
export default class RouteManager {
    static async handleRoute(route, params, callback){
        switch(route){
            case 'users':
                const filePath = path.join(process.cwd(), 'src/api/', route);
                const usersEndpoint = require(filePath);
                return usersEndpoint.execute(params, callback);
            default:
                return 'no matching endpoint!';
        }
    }
}