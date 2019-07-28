'use strict'
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import { MongoClient } from 'mongodb';
import PlayersDAO from '../dao/playersDAO';
import GetLeagueData from '../requests/getLeagueData';
import { getUniqueValues, groupingBy, isInt, colors } from '../utils/utils';
import { has } from '../utils/objectCallers';
import ManagersDAO from '../dao/managersDAO';
import { dbs } from '../utils/common';

let [league] = process.argv.slice(2);

async function getLeagueInfo() {
    const handleLeage = new GetLeagueData(league);
    const { message: data } = await handleLeage.getLeagueInfo();
    // console.log(data)
    return data;
}

async function getPlayers() {
    const handleLeage = new GetLeagueData(league);
    const { message: data } = await handleLeage.getPlayers();
    console.log(data)
}

let client;
async function getPlayer(id) {
    try {
        if (!client) {
            client = await MongoClient.connect( process.env.BWNGR_DB_URI, { poolSize: 100, useNewUrlParser: true });
        }
        const db = league !== 'undefined' && league === 'pl' ? client.db(process.env.BWNGR_DB_PL) : client.db(process.env.BWNGR_DB);
        if (!league) {
            console.log('league missing, using la liga by default');
        }
        await PlayersDAO.injectDB(db);
        console.log('\x1b[34m', 'id:', id, '\x1b[0m')
        return await PlayersDAO.getPlayer({ id_bwngr: parseInt(id) }, { projection: { _id: 0, name: 1 } });
    } catch (e) {
        console.error('=====Error:', e.toString());
        console.error('=====Error stack:', e.stack);
    }
    return false;
}

async function getTeams() {
    const handleLeage = new GetLeagueData(league);
    const { data } = await handleLeage.getTeams();
    console.log(data)
    // const dataArray = Object.values(data);
    // console.log(dataArray.length);
    // console.log(dataArray[0]);
    // console.log(dataArray[dataArray.length -1]);
}

async function getManagers() {
    const handleLeage = new GetLeagueData(league);
    const { message: data } = await handleLeage.getManagers();
    console.log(data)
}

async function getManagersFromDB(leagueDefault = 'liga'){
    try {
        if(!client){
            client = await MongoClient.connect(process.env.BWNGR_DB_URI, {useNewUrlParser: true})
        }
        const db =  client.db(dbs[leagueDefault]);
        await ManagersDAO.injectDB(db);
        const managers = await ManagersDAO.getManager({}, {projection: {_id: 0}});
        managers.forEach(manager => {
            const {name, id_bwngr, balance} = manager;
            console.log(`${name} ----- ${id_bwngr} ----- ${balance}`)
            // console.log(manager)
        });
    } catch (e) {
        console.log(`${colors.red} Error: ${String(e)}`)
        console.log(`Error Stack: ${String(e.stack)} ${colors.reset}`)
    }
    if(client){
        client.close()
    }
}

async function getRounds() {
    const { data: { season } } = await getLeagueInfo();
    console.log(season);
}

async function getTransactions() {
    console.log('\x1b[47m \x1b[34m');
    console.time("startTrans");
    console.timeLog("startTrans", "Starting fetching data …");
    console.log('\x1b[0m')
    try {
        const handleLeage = new GetLeagueData(league);
        const resp = await handleLeage.getTransactions(0, 50);
        console.timeLog("startTrans", "data fetched");
        // console.log(resp.message[0].content)//.filter( x => x.content.length>1 && x.type === 'market').map( x => x.content)[0])//.map(x=> x.content));
        let counter = 1;
        let filtered = resp.message;//.filter( x => moment.unix(x.date).format('MM-DD-YYYY') === moment('2019-07-19').format('MM-DD-YYYY'));
        // console.log(filtered)

        for (let i = 0; i < filtered.length; i++) {
            for (let j = 0; j < filtered[i].content.length; j++) {
                const result = await getPlayer(filtered[i].content[j].player);
                const player = !result ? 'player is not in the league' : result[0].name;
                const type = filtered[i].type;
                const moveFrom = has.call(filtered[i].content[j], 'from') ? filtered[i].content[j].from : 'market';
                const moveTo = has.call(filtered[i].content[j], 'to') ? filtered[i].content[j].to : 'market';
                const amount = filtered[i].content[j].amount;
                const [{price}] = await PlayersDAO.getPlayerCurrentPrice(parseInt(filtered[i].content[j].player));
                console.log(`\x1b[32m price: ${price} \x1b[0m`)
                console.log('has bids', has.call(filtered[i].content[j], 'bids'))
                console.log(`deal ${counter}: `, {
                    type: type,
                    player: player,
                    date: filtered[i].date,//new Date(filtered[i].date*1000),
                    moveFrom: moveFrom,
                    moveTo: moveTo,
                    amount: amount,
                    bids: has.call(filtered[i].content[j], 'bids') ? filtered[i].content[j].bids.map(bid => ({
                        player: filtered[i].content[j].player,
                        manager: bid.user.id,
                        amount: bid.amount,
                        overprice: parseInt(bid.amount) - parseInt(price),
                        date: filtered[i].date
                    })) : 'none'
                });
                counter++;
            }
        }
        if (client) client.close();
        console.log('\x1b[47m \x1b[34m');
        console.timeEnd("startTrans");
        console.log('\x1b[0m');
    } catch (e) {
        console.log('\x1b[31m', `A problem ocurred while getting transactions.Error--  ${String(e)}`);
        console.log('\x1b[31m', `=====Error stack: ${String(e.stack)}`, '\x1b[0m');
        if (client) client.close();
        console.log('\x1b[47m \x1b[34m');
        console.timeEnd("startTrans");
        console.log('\x1b[0m');
        process.exit(1)
    }

}

async function testPlayersDAO() {
    try {
        client = MongoClient.connect(
            process.env.BWNGR_DB_URI,
            { useNewUrlParser: true }
        );
        const db = league !== 'undefined' ? client.db(dbs[league]) : client.db(process.env.BWNGR_DB_TEST);
        if (!league) {
            console.log('league missing, using test liga by default');
        }
        await PlayersDAO.injectDB(db);
        const player = await PlayersDAO.getPlayer(140);
        console.log(player);
        client.close();
    } catch (err) {
        console.error('=====Error:', err.toString());
        console.error('=====Error stack:', err.stack);
        client.close();
        process.exit(1)
    }
}

function playWithDates() {
    const currentYear = moment().year();
    const initDate = `07-20-${currentYear}`;
    const date1 = moment('2019-05-18');
    const date2 = moment(1563858333 * 1000);
    const date3 = moment.unix(1563593436, 'MM-DD-YYYY')
    console.log(`today: ${moment().format("YYYY-MM-DD")}`)
    console.log(`date1 in unixtime: ${date1.unix()}`)
    console.log(`init date: ${initDate}`)
    console.log('initDate > date1:', initDate > date1.format('MM-DD-YYYY'))
    console.log('initDate > date2:', initDate > date2.format('MM-DD-YYYY'))
    console.log('date 2 formatted:', date2.format('MM-DD-YYYY'))
    console.log(date3.format('MM-DD-YYYY'))
    console.log('date 2 equals to date 3?==>', date2.format('MM-DD-YYYY') === date3.format('MM-DD-YYYY')) // returns true at the moment because it was at the same day
    console.log(date1.isSame(date2, 'day'))
    console.log(date1.isSame(date3, 'day'))
}

const groupByPlayer = (groupKeys, currentRow) => {
    return groupingBy('player', 'value', groupKeys, currentRow)
};

const testGrouping = () => {
    const sample = [
        { player: 1, value: 20 },
        { player: 3, value: 25 },
        { player: 2, value: 15 },
        { player: 2, value: 10 },
        { player: 3, value: 5 },
        { player: 1, value: 50 }
    ];
    const keys = getUniqueValues(sample.map(player => player.player));
    console.log('unique players values: ', keys);
    const groupResult = sample.reduce(groupByPlayer, {})
    console.log('groupResult: ', groupResult);
}

const auxFunc = () => {
    console.log('\'7\' is int:', isInt('7'));
    console.log('a is int:', isInt('a'));
    console.log(1563505304 > 1563249600);
}

const show_me_stuff = async () => {
    const handleLeage = new GetLeagueData(league);
    const { message: data } = await handleLeage.getRecentRounds(0,20);
    console.log('rounds: ',data)
}

// show_me_stuff();
// testGrouping();
playWithDates();
// getTransactions();
// auxFunc();
// testPlayersDAO();
// getPlayers();
// getManagers();
// getManagersFromDB(league);
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