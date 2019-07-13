'use strict'
require("dotenv").config();
import 'core-js/stable';
import { MongoClient } from 'mongodb';
import PlayersDAO from '../dao/playersDAO';
import GetLeagueData from '../requests/getLeagueData';

let [league] = process.argv.slice(2);

async function getLeagueInfo() {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getLeagueInfo();
    // console.log(data)
    return data;
}

async function getPlayers() {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getPlayers();
    console.log(data)
}

async function getTeams() {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getTeams();
    console.log(data)
    // const dataArray = Object.values(data);
    // console.log(dataArray.length);
    // console.log(dataArray[0]);
    // console.log(dataArray[dataArray.length -1]);
}

async function getManagers() {
    const handleLeage = new GetLeagueData(league);
    const { message: data} = await handleLeage.getManagers();
    console.log(data)
}

async function getRounds(){
    const { data: {season} } = await getLeagueInfo();
    console.log(season);
}

async function testPlayersDAO() {
    MongoClient.connect(
        process.env.BWNGR_DB_URI,
        { useNewUrlParser: true }
    ).catch( err => {
        console.error('=====Error:', err.toString());
        console.error('=====Error stack:', err.stack);
        client.close();
        process.exit(1)
    }).then( async client => {
        const db = league !== 'undefined' && league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
        if(!league){
            console.log('league missing, using la liga by default');
        }
        await PlayersDAO.injectDB(db);
        const  player = await PlayersDAO.getPlayer(140);
        console.log(player);
        client.close();
    });

}

testPlayersDAO();
// getPlayers();
// getManagers();
// getTeams();
// getLeagueInfo();
// getRounds();


// const fs = require('fs')
// const Token = require('../includes/auth/token')
// const token = new Token()
// const payload = {
//     userName: 'testingUser6',
//     msg: 'have nice day!',
//     bwngr551251: 1
// }
// const privateKEY  = fs.readFileSync('../includes/secrets/private.key', 'utf8');
// const publicKEY  = fs.readFileSync('../includes/secrets/public.key', 'utf8');
// const tokenGenerated = token.sign(payload,{audience:'myBwngrScan'},privateKEY)
// console.log('token',tokenGenerated)
// console.log('\n')
// const legit = token.verify(tokenGenerated,{audience:'myBwngrScan'}, publicKEY)
// console.log('verifid token: ', legit)
// console.log('\n')
// const tokenDecoded = token.decode('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6MywibXNnIjoiaGF2ZSBuaWNlIGRheSEiLCJpYXQiOjE1NjA0ODg4NDksImV4cCI6MTU2MDUzMjA0OSwiYXVkIjoibXlCd25nclNjYW4iLCJpc3MiOiJTRU5TRUxFU1NAVEVBTSJ9.XrV5f8_BQNIEbGfvFrftdlQhpBMBMU-VdUzNX1Ok9k3Py1jw8uXTVriGOWozDJMmPUzp8iUKiYogUyRaOv2KoA')
// console.log('token decoded: ', tokenDecoded)