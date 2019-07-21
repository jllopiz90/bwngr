'use strict';
require("dotenv").config();
import 'core-js/stable';
import PlayersDAO from '../dao/playersDAO';
import GetLeagueData from '../requests/getLeagueData';
import { MongoClient } from "mongodb";

//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

const [league] = process.argv.slice(2);
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
const isInt = (value) => Number.isInteger(parseInt(value));

const adjustPrice = async (league = 'liga') => {
    const handleLeage = new GetLeagueData(league);
    const { message: data } = await handleLeage.getPlayers();
    const dataArray = Object.values(data).map(player => ({
        id_bwngr: player.id,
        price: player.price,
        price_increment: player.priceIncrement
    }));
    
    MongoClient.connect(
        process.env.BWNGR_DB_URI,
        { useNewUrlParser: true })
        .catch(err => {
            console.error('\x1b[31m =====Error:', err.toString());
            console.error('\x1b[31m =====Error stack:', err.stack);
            client.close();
            process.exit(1)
        })
        .then(async client => {
            let result;
            const db = client.db(dbs[league]);
            await PlayersDAO.injectDB(db);
            result = await PlayersDAO.updatePrice(dataArray)
            console.log(result);
            client.close()
        });
}

if (league) {
    console.log(`using league ${league}`)
    adjustPrice(league);
} else {
    console.log('missing params using la liga by default');
    adjustPrice();
}

