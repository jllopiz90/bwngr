"use strict";

const path = require('path');

export default class RouteManager {
    static async handleRoute(route, params){
        const parts = route.split(path.sep);
        const endpoint = parts[parts.length -1];
        switch(endpoint){
            case 'users':
                const filePath = path.join(process.cwd(), 'src/api/', endpoint);
                const usersEndpoint = require(filePath);
                return await usersEndpoint.execute(params);
            default:
                return 'no matching endpoint!';
        }
    }
}