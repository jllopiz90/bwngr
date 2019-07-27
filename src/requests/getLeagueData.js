'use strict';
require("dotenv").config();
import axios from 'axios';
const leagues = {
    'test': process.env.BWNGR_TEST_LEAGUE,
    'liga': process.env.BWNGR_LEAGUE,
    'pl': process.env.BWNGR_PL_LEAGUE
};
const users = {
    'test': process.env.BWNGR_TEST_USER,
    'liga': process.env.BWNGR_USER,
    'pl': process.env.BWNGR_PL_USER
};
export default class GetLeageData {
    constructor(league='liga') {
        const leagueHeader = leagues[league];
        const userHeader = users[league];
        this.league = league;
        this.client = axios.create({
            baseURL: 'https://biwenger.as.com/api/v2',
            timeout: 10000,
            headers: {
                authorization: process.env.BWNGR_BEARER,
                'content-type': 'application/json; charset=utf-8',
                'accept': 'application/json, text/plain, */*',
                'X-Version': '574',
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
                    type:'transfer,market,exchange,loan,loanReturn,clauseIncrement,auctions',
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

    async getCurrentMarket() {
        try {
            const uri = 'market';
            const { data: {data: {sales}}} = await this.client.get(uri);
            const salesFormatted = sales.map( sale => ({
                player: sale.player.id,
                price: sale.price
            }));
            return {
                success: true, message: salesFormatted
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

    async getRecentRounds(offSet = 0, limit = 1) {
        try {
            const uri = 'league/board';
            const { data: {data} } = await this.client.get(uri,{
                params: {
                    type: 'roundFinished',
                    offset: offSet,
                    limit: limit
                }
            });
            return {
                success: true, message: data
            };
        } catch(e) {
            console.error(`Error ocurred while getting league info from bwnger.--${String(e)}`);
        }
    }
}