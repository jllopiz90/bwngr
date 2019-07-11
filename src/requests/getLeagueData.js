'use strict';
import axios from 'axios';

export default class GetLeageData {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://biwenger.as.com/api/v2',
            timeout: 10000,
            headers: {
                authorization: process.env.BWNGR_BEARER,
                'content-type': 'application/json; charset=utf-8',
                'accept': 'application/json, text/plain, */*',
                'X-Version': '569',
                'X-League': process.env.BWNGR_LEAGUE,
                'X-User': process.env.BWNGR_USER,
                'X-Lang': 'en'
            }
        });
    }

    async getManagers(){
        try {
            const   { data: { data: { standings } } } = await this.client.get('/league?fields=standings');
            return {success: true, message: standings};
        } catch(e) {
            console.error(`Error ocurred while getting users from bwnger.-- ${e}`);
        }
    }

    async getPlayers(){
        try {
            const   { data: { data: {players} } }   = await this.client.get('/competitions/la-liga/data?lang=es&score=1');
            return {success: true, message: players};
        } catch(e) {
            console.error(`Error ocurred while getting players from bwnger.--${e}`);
        }
    }
}