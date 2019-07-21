'use strict'
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import { MongoClient } from "mongodb";

const playerPositions = ['gk','df','mf','st']; 
const [league] = process.argv.slice(2);
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};

const getPlayers = async (league = 'liga')=> {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getPlayers();
    const currentYear = moment().year();
    const initDate = `07-20-${currentYear}`;
    const dataArray = Object.values(data).map( player => ({
            id_bwngr:  player.id,
            name: player.name,
            slug: player.slug,
            team_id: player.teamID,
            position: playerPositions[player.position - 1],
            price: player.price,
            price_increment: player.priceIncrement,
            owner: 'market',
            own_since: initDate
    }));
    MongoClient.connect(
        process.env.BWNGR_DB_URI,
        { useNewUrlParser: true })
        .catch(err => {
            console.error('\x1b[31m =====Error:', String(err));
            console.error('\x1b[31m =====Error stack:', err.stack);
            client.close();
            process.exit(1)
        })
        .then(async client => {
            const db = client.db(dbs[league]);
            await PlayersDAO.injectDB(db);
            const result = await PlayersDAO.insertPlayersBulk(dataArray)
            console.log(result);   
            client.close()
        });
}

if(league){
    console.log(`using league ${league}`);
    getPlayers(league);
}else{
    console.log('missing params using la liga by default');
    getPlayers();
}
