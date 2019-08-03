'use strict';
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import { MongoClient } from "mongodb";
import PlayersDAO from './playersDAO';
import GetLeagueData from '../../requests/getLeagueData';
import { dbs, handleError } from '../../utils/common';

const playerPositions = ['gk','df','mf','st']; 

export default async function initPlayers(league = 'liga'){
    let clientResolved;
    try {
        const promiseClient = MongoClient.connect( process.env.BWNGR_DB_URI,{ useNewUrlParser: true });   
        const handleLeage = new GetLeagueData(league);
        const playersData  = handleLeage.getPlayers();
        const moment_today = moment();
        const currentYear = moment_today.year();
        const initDate = league === 'test' ? `${currentYear}-07-16` : `${moment().format("YYYY-MM-DD")}`;
        const { data: { data: {players} } } = await playersData;
        const dataArray = Object.values(players).map( player => ({
            id_bwngr:  player.id,
            name: player.name,
            slug: player.slug,
            team_id: player.teamID,
            position: playerPositions[player.position - 1],
            price: player.price,
            price_increment: player.priceIncrement,
            owner: 'market',
            own_since: moment(initDate).unix()
        }));
        clientResolved =  await promiseClient;
        const db = clientResolved.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        const result = await PlayersDAO.insertPlayersBulk(dataArray) 
        clientResolved.close();
        console.log(result ? 'init players done' : 'a problem occured while init players');
    } catch (err) {
        handleError(err)
    }
}

export async function adjustPrice(league = 'liga'){
    let promiseClient;
    try {
        promiseClient = MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });    
        const handleLeage = new GetLeagueData(league);
        const promiseGetPlayers = handleLeage.getPlayers();
        const { data: { data: {players} } } = await promiseGetPlayers;
        const dataArray = Object.values(players).map(player => ({
            id_bwngr: player.id,
            price: player.price,
            price_increment: player.priceIncrement
        }));
        const client = await promiseClient;
        const db = client.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        const result = await PlayersDAO.updatePrice(dataArray)
        console.log(result);
        client.close();
    } catch (err) {
        const client = promiseClient && await promiseClient;
        client && client.close();
        handleError(err);
    }
}