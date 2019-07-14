'use strict'
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import { MongoClient } from "mongodb";

const playerPositions = ['gk','df','mf','st']; 
const [league] = process.argv.slice(2);

const getPlayers = async (league = 'liga')=> {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getPlayers();
    const dataArray = Object.values(data).map( player => ({
            id_bwngr:  player.id,
            name: player.name,
            slug: player.slug,
            team_id: player.teamID,
            position: playerPositions[player.position - 1],
            price: player.price,
            // fantasyPrice: player.fantasyPrice,
            price_increment: player.priceIncrement,
    }));
    MongoClient.connect(
        process.env.BWNGR_DB_URI,
        { useNewUrlParser: true })
        .catch(err => {
            console.error('=====Error:', String(err));
            console.error('=====Error stack:', err.stack);
            client.close();
            process.exit(1)
        })
        .then(async client => {
            const db = league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
            await PlayersDAO.injectDB(db);
            const result = await PlayersDAO.upsertPlayersBulk(dataArray)
            console.log(result);
            client.close()
        });
}

if(league){
    getPlayers(league);
}else{
    console.log('missing params using la liga by default');
    getPlayers();
}
