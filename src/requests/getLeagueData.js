'use strict';
require("dotenv").config();
import axios from 'axios';
import { colors } from '../utils/utils';

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
            return this.client.get('/league',{
                params: {
                    fields: 'standings'
                }
            });
        } catch(e) {
            console.log(`${colors.red}Error ocurred while getting users from bwnger.-- ${String(e)}`);
        }
        return {success: false, message: 'Error fetching data.'};
    }

    async getPlayers(){
        const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
        const players = this.client.get(uri,{
            params: {
                lang: 'en',
                score: '1'
            }
        });
        return players;
    }

    async getTeams(){
        try {
            const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
            return this.client.get(uri,{
                params: {
                    lang: 'en',
                    score: '1'
                }
            });
        } catch(e) {
            console.error(`Error ocurred while getting league info from bwnger.--${String(e)}`);
        }
        return false;
    }

    async getTransactions(offSet,limit) {
        try {
            const uri = 'league/board';
            const { data: {data}} = this.client.get(uri,{
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
        return {success: false, message: 'Error fetching data.'};
    }

    async getCurrentMarket() {
        try {
            const uri = 'market';
            return this.client.get(uri);
        } catch (e) {
            console.error(`Error ocurred while getting market.Error--${String(e)}`)
        }
        return false;
    }

    async getLeagueInfo(){
        try {
            const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
            const   { data }   = this.client.get(uri,{
                params: {
                    lang: 'en',
                    score: '1'
                }
            });
            return {success: true, message: data};
        } catch(e) {
            console.error(`Error ocurred while getting league info from bwnger.--${String(e)}`);
        }
        return {success: false, message: 'Error fetching data.'};
    }

    async getRecentRounds(offSet = 0, limit = 1) {
        try {
            const uri = 'league/board';
            const { data: {data} } = this.client.get(uri,{
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
        return {success: false, message: 'Error fetching data.'};
    }
}