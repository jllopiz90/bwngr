'use strict';
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import { MongoClient } from 'mongodb';
import { formatToCurrency } from '../utils/utils';

const [league] = process.argv.slice(2);
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};

async function getMarket(league ='liga') {
    const leagueHandler = new GetLeagueData(league);
    const {success, message } = await leagueHandler.getCurrentMarket();

    if(success) {
        try {
            if(!client) {
                client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
            }
            const db = client.db(dbs[league]);
            await PlayersDAO.injectDB(db);
            for (let i = 0; i < message.length; i++) {
                const sale = message[i];
                const [{name}] = await PlayersDAO.getPlayer({id_bwngr: sale.player}, {projection: {_id: 0, name: 1}});
                console.log(`\x1b[44m \x1b[33m player: ${name} \x1b[30m ---- \x1b[32m price: ${formatToCurrency(sale.price)} \x1b[0m`);
            }
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while displaying current market.Error-- ${String(e)}`);
            console.log(`.Error Stack-- ${String(e.stack)}`,'\x1b[0m');
        }
    }
    if(client) {
        client.close()
    };
}

let client;
if(!league) {
    console.log('params missing uing la liga by default');
    getMarket()
}else {
    console.log(`using liga ${league}`);
    getMarket(league)
}