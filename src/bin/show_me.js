'use strict'
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import { MongoClient } from 'mongodb';
import PlayersDAO from '../dao/playersDAO';
import GetLeagueData from '../requests/getLeagueData';

let [league] = process.argv.slice(2);
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};

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

let client;
async function getPlayer(id) {
    try {
        if(!client) {
            client = await MongoClient.connect(
                process.env.BWNGR_DB_URI,
                {poolSize: 100, useNewUrlParser: true }
            );
        }
        const db = league !== 'undefined' && league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
        if(!league){
            console.log('league missing, using la liga by default');
        }
        await PlayersDAO.injectDB(db);
        const  player = await PlayersDAO.getPlayer(id);
        return player;
    } catch (e) {
        console.error('=====Error:', e.toString());
        console.error('=====Error stack:', e.stack);
        client.close();
        process.exit(1)
    }
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

async function getTransactions() {
    const has = Object.prototype.hasOwnProperty;
    const handleLeage = new GetLeagueData(league);
    const resp = await handleLeage.getTransactions(0,50);
    // console.log(resp.message[0].content)//.filter( x => x.content.length>1 && x.type === 'market').map( x => x.content)[0])//.map(x=> x.content));
    let counter = 1;
    let filtered =  resp.message;//.filter( x => x.type === 'transfer');
    for(let i =0; i < filtered.length; i++){
        for(let j = 0; j < filtered[i].content.length; j++){
            const player = await getPlayer(filtered[i].content[j].player);
            const type = filtered[i].type;
            const moveFrom = has.call(filtered[i].content[j],'from') ? filtered[i].content[j].from : 'market';
            const moveTo = has.call(filtered[i].content[j],'to') ? filtered[i].content[j].to : 'market';
            const amount = filtered[i].content[j].amount;
            console.log(`deal ${counter}: `,{
                type: type,
                player: player && has.call(player,'name') ? player.name : 'player is not in the league',
                date: filtered[i].date,//new Date(filtered[i].date*1000),
                moveFrom:moveFrom,
                moveTo: moveTo, 
                amount: amount,
                bids: has.call(filtered[i].content[j],'bids') ? filtered[i].content[j].bids : 'none',
                firstBidUser:has.call(filtered[i].content[j],'bids') ? filtered[i].content[j].bids[0].user : 'none'
            });
            counter ++;
        }
    }
    client.close();
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
        const db = league !== 'undefined' ? client.db(dbs[league]) : client.db(process.env.BWNGR_DB_TEST);
        if(!league){
            console.log('league missing, using test liga by default');
        }
        await PlayersDAO.injectDB(db);
        const  player = await PlayersDAO.getPlayer(140);
        console.log(player);
        client.close();
    });

}

function playWithDates(){
    const date1 = moment('2019-05-18');
    const date2 = moment();//moment(1563505304*1000);
    const date3 = moment.unix(1563510940,'MM-DD-YYYY', true)
    console.log(date1)
    console.log(date2.format('MM-DD-YYYY'))
    console.log(date3.format('MM-DD-YYYY'))
    console.log('date 2 equals to date 3?==>',date2.format('MM-DD-YYYY') === date3.format('MM-DD-YYYY')) // returns true at the moment because it was at the same day
    console.log(date1.isSame(date2, 'day'))
    console.log(date1.isSame(date3,'day'))
}

const auxFunc = async () => {
    const player = await getPlayer(9685);
    console.log(player)
}

playWithDates();
// getTransactions();
// auxFunc();
// testPlayersDAO();
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