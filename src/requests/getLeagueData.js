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
            const   { data: { data: { standings } } } = await this.client.get('/league',{
                params: {
                    fields: 'standings'
                }
            });
            return {success: true, message: standings};
        } catch(e) {
            console.error(`Error ocurred while getting users from bwnger.-- ${String(e)}`);
        }
    }

    async getPlayers(){
        try {
            const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
            const   { data: { data: {players} } }   = await this.client.get(uri,{
                params: {
                    lang: 'en',
                    score: '1'
                }
            });
            return {success: true, message: players};
        } catch(e) {
            console.error(`Error ocurred while getting players from bwnger.--${String(e)}`);
        }
    }

    async getTeams(){
        try {
            const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
            const   { data: {data: {teams}} }   = await this.client.get(uri,{
                params: {
                    lang: 'en',
                    score: '1'
                }
            });
            return {success: true, message: teams};
        } catch(e) {
            console.error(`Error ocurred while getting league info from bwnger.--${String(e)}`);
        }
    }

    async getTransactions(offSet,limit) {
        try {
            const uri = 'league/board';
            const { data: {data}} = await this.client.get(uri,{
                params: {
                    type:'transfer,market,exchange,loan,loanReturn,clauseIncrement',
                    offset: offSet,
                    limit: limit
                }
            });
            return {
                success: true, message: data
            };
        } catch (e) {
            console.error(`Error ocurred while getting transactions.Error--${String(e)}`)
        }
    }

    async getLeagueInfo(){
        try {
            const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
            const   { data }   = await this.client.get(uri,{
                params: {
                    lang: 'en',
                    score: '1'
                }
            });
            return {success: true, message: data};
        } catch(e) {
            console.error(`Error ocurred while getting league info from bwnger.--${String(e)}`);
        }
    }
}