'use strict';
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import GetLeagueData from '../requests/getLeagueData';

let [league,date = false] = process.argv.slice(2);
const date_moment = date ? moment(date) : moment();
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};

async function getTransfers(date,league = 'liga') {
    const has = Object.prototype.hasOwnProperty;
    const handleLeage = new GetLeagueData(league);
    const deals = await handleLeage.getTransactions(0,20);
}

getTransfers(date_moment, league);


