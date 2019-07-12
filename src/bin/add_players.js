'use strict'
require("dotenv").config();
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import { MongoClient } from "mongodb";

const playerPositions = ['gk','df','mf','st']; 

const getPlayers = async ()=> {
    const handleLeage = new GetLeagueData();
    const { message: data} = await handleLeage.getPlayers();
    const dataArray = Object.values(data).map( player => ({
            id_bwngr:  player.id,
            name: player.name,
            slug: player.slug,
            team_id: player.teamID,
            position: playerPositions[player.position - 1],
            price: player.price,
            fantasyPrice: player.fantasyPrice,
            price_increment: player.priceIncrement,
    }));
    MongoClient.connect(
        process.env.BWNGR_DB_URI,
        { useNewUrlParser: true })
        .catch(err => {
            console.error('=====Error:', String(err));
            console.error('=====Error stack:', err.stack);
            process.exit(1)
        })
        .then(async client => {
            await PlayersDAO.injectDB(client);
            const result = await PlayersDAO.insertPlayersBulk(dataArray)
            console.log(result);
            client.close()
        });
}

getPlayers();