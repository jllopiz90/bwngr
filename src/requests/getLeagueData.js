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
    constructor(league = 'pl') {
        const leagueHeader = leagues[league];
        const userHeader = users[league];
        this.league = league;
        this.leagueHeader = leagueHeader;
        this.client = axios.create({
            baseURL: 'http://biwenger.as.com/api/v2',
            timeout: 10000,
            headers: {
                authorization: process.env.BWNGR_BEARER,
                'content-type': 'application/json; charset=utf-8',
                'accept': 'application/json, text/plain, */*',
                'X-version': '613',
                'X-league': leagueHeader,
                'X-user': userHeader,
                'X-lang': 'es'
            }
        });
    }

    async getManagers() {
        return this.client.get('/league', {
            params: {
                fields: 'standings'
            }
        });
    }

    async getPlayers() {
        const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
        const players = this.client.get(uri, {
            params: {
                lang: 'es',
                score: '1'
            }
        });
        return players;
    }

    async getTeams() {
        const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
        return this.client.get(uri, {
            params: {
                lang: 'es',
                score: '1'
            }
        });
    }

    async getTransactions(offSet, limit) {
        const uri = `/league/${this.leagueHeader}/board?`;
        return this.client.get(uri, {
            params: {
                type: 'transfer,market,exchange,loan,loanReturn,clauseIncrement,auctions,adminTransfer',
                offset: offSet,
                limit: limit
            }
        });
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

    async getLeagueInfo() {
        const uri = this.league === 'pl' ? '/competitions/premier-league/data' : '/competitions/la-liga/data';
        return this.client.get(uri, {
            params: {
                lang: 'es',
                score: '1'
            }
        });
    }

    async getRecentRounds(offSet = 0, limit = 7) {
        const uri = `league/${this.leagueHeader}/board`;
        return this.client.get(uri, {
            params: {
                type: 'roundFinished',
                offset: offSet,
                limit: limit
            }
        });
    }

    async getBonus(offSet = 0, limit = 11) {
        const uri = `league/${this.leagueHeader}/board`;
        return this.client.get(uri, {
            params: {
                type: 'bonus',
                offset: offSet,
                limit: limit
            }
        });
    }
}