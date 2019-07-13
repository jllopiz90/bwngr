'use strict';
import axios from 'axios';

export default class GetLeageData {
    constructor(league='liga') {
        const leagueHeader = league === 'pl' ? process.env.BWNGR_PL_LEAGUE : process.env.BWNGR_LEAGUE;
        const userHeader = league === 'pl' ? process.env.BWNGR_PL_USER : process.env.BWNGR_USER;
        this.league = league;
        this.client = axios.create({
            baseURL: 'https://biwenger.as.com/api/v2',
            timeout: 10000,
            headers: {
                authorization: process.env.BWNGR_BEARER,
                'content-type': 'application/json; charset=utf-8',
                'accept': 'application/json, text/plain, */*',
                'X-Version': '569',
                'X-League': leagueHeader,
                'X-User': userHeader,
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
            const uri = this.league === 'pl' ? '/competitions/premier-league/data?lang=es&score=1' : '/competitions/la-liga/data?lang=es&score=1';
            const   { data: { data: {players} } }   = await this.client.get(uri);
            return {success: true, message: players};
        } catch(e) {
            console.error(`Error ocurred while getting players from bwnger.--${e}`);
        }
    }
}