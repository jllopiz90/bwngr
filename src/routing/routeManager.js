"use strict";

const path = require('path');

export default class RouteManager {
    static async handleRoute(route, params){
        const parts = route.split('?')[0].split(path.sep);
        const endpoint = parts[parts.length -1];
        let filePath;
        switch(endpoint){
            case 'users':
                filePath = path.join(process.cwd(), 'src/api/', endpoint);
                const usersEndpoint = require(filePath);
                return await usersEndpoint.execute(params);
            case 'league':
                filePath = path.join(process.cwd(), 'src/api/', endpoint);
                const leagueEndpoint = require(filePath);
                return await leagueEndpoint.execute(params);
            default:
                return 'no matching endpoint!';
        }
    }
}