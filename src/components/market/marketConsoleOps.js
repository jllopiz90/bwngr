'use strict';
import 'core-js/stable';
import { MongoClient } from 'mongodb';
import GetLeagueData from '../../requests/getLeagueData';
import TransfersDAO from './transfersDAO';
import PlayersDAO from '../players/playersDAO';
import ManagersDAO from '../managers/managersDAO';
import TeamsDAO from '../teams/teamsDAO';
import { dbs, handleError } from '../../utils/common';
import { colors, groupingByWithCount, formatToCurrency, getDataSorted } from '../../utils/utils';
require("dotenv").config();

const maxBid = (balance, teamValue) => balance + teamValue / 4;
const teamValue = (acumulator, currentRow) => acumulator + currentRow['price'];
const groupByManager = (groupKeys, currentRow) => groupingByWithCount('manager', 'overprice', groupKeys, currentRow);

export async function getMarket(league = 'pl') {
    let client;
    try {
        const leagueHandler = new GetLeagueData(league);
        const promiseMarket = leagueHandler.getCurrentMarket();
        const promiseClient =  MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        const { data: { data: { sales } } } = promiseMarket ? await promiseMarket : {data:{data:{sales:[]}}};
        if(!sales.length){
            console.log('problem getting market from bwngr');
            client = await promiseClient;
            client.close();
        } else {
            const salesFormatted = sales.map(sale => ({
                player: sale.player.id,
                price: sale.price
            }));
            client = await promiseClient;
            const db =  client.db(dbs[league]);
            await PlayersDAO.injectDB(db);
            await TeamsDAO.injectDB(db);
            const teams = await TeamsDAO.getTeam({}, {projection: {_id:0, name: 1, id_bwngr: 1}});
            for (let i = 0; i < salesFormatted.length; i++) {
                const sale = salesFormatted[i];
                const result = await PlayersDAO.getPlayer({id_bwngr: sale.player}, {projection: {_id: 0, name: 1, team_id: 1}});
                if(result) {
                    const [{name, team_id}] = result;
                    const teamName = team_id 
                            ? teams.filter( team => team.id_bwngr === team_id)[0]['name']
                            : 'abandon the league';
                    console.log(`${colors.yellow} player: ${name} ${colors.black} ---- ${colors.green} price: ${formatToCurrency(sale.price)} ${colors.reset} --- team: ${teamName}`);
                    await getPlayerPrevBids(sale.player,db);
                } else {
                    console.log('player not found, id: ', sale.player)
                }
            }
            await getManagersState(db);
            client.close();
        }
    } catch (e) {
        handleError(e);
        client && client.close();
    }
}


// get balance, all players group by position value for each, total value and player amount for position, total total value and players amount, max bid
async function getManagersState(db) {
    await ManagersDAO.injectDB(db);
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    const teamPromises = managers.map( async manager => ({team: await PlayersDAO.getPlayer({ owner: manager.id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1 } }), id_bwngr: manager.id_bwngr}));
    const teams = await Promise.all(teamPromises);
    const managersWithTeamValue = managers.map( manager => {
        const { id_bwngr, balance } = manager;
        const { team } = teams.find( manager => manager.id_bwngr === id_bwngr);
        const team_value = team.reduce(teamValue,0);
        const max_bid = maxBid(balance, team_value);
        return {...manager, max_bid, team_value, team};
    });
    const managerSorted = getDataSorted(managersWithTeamValue,'max_bid');
    console.log(`  ${colors.black} =======================================================`);
    console.log(`${colors.reset}MANAGERS STATE: `);
    for (let i = 0; i < managerSorted.length; i++) {
        const { name, balance, team, max_bid, team_value } = managerSorted[i];
        console.log(`Manager # ${i+1} - ${name} State:`);
        let gksValue = 0, dfsValue = 0, mfsValue = 0, stsValue = 0;
        if (team) {
            const gks = team.filter(player => player.position === 'gk');
            const dfs = team.filter(player => player.position === 'df');
            const mfs = team.filter(player => player.position === 'mf');
            const sts = team.filter(player => player.position === 'st');
            console.log('Gk position:');
            gks.forEach(({ name, price }) => {
                gksValue += parseInt(price);
                console.log(`${colors.reset} ${name} ---- ${colors.green} price: ${formatToCurrency(price)}`);
            });
            console.log(`${colors.reset}Gks total value: ${colors.green} ${formatToCurrency(gksValue)}`);
            console.log(`${colors.reset}Def position:`);
            dfs.forEach(({ name, price }) => {
                dfsValue += parseInt(price);
                console.log(`${colors.reset} ${name} ---- ${colors.green} price: ${formatToCurrency(price)}`);
            });
            console.log(`${colors.reset}Defenses total value: ${colors.green} ${formatToCurrency(dfsValue)}`);
            console.log(`${colors.reset}Mf position:`);
            mfs.forEach(({ name, price }) => {
                mfsValue += parseInt(price);
                console.log(`${colors.reset} ${name} ---- ${colors.green} price: ${formatToCurrency(price)}`);
            });
            console.log(`Midfielders total value: ${colors.green} ${formatToCurrency(mfsValue)}`);
            console.log(`${colors.reset}Striker position:`);
            sts.forEach(({ name, price }) => {
                stsValue += parseInt(price);
                console.log(`${colors.reset} ${name} ---- ${colors.green} price: ${formatToCurrency(price)}`);
            });
            console.log(`${colors.reset}Strikers total value: ${colors.green} ${formatToCurrency(stsValue)}`);
            console.log(`${colors.reset}Total players amount: `, gks.length + dfs.length + mfs.length + sts.length);
            console.log(`${colors.reset}Total team value: , ${colors.green} ${formatToCurrency(team_value)}`);
            console.log(`${colors.reset}Manager Balance: ${colors.green} ${formatToCurrency(balance)}`);
            console.log(`${colors.reset}Manager Max Bid: ${colors.green} ${formatToCurrency(max_bid)}`);
            console.log(`${colors.black} =======================================================  ${colors.reset}`);
        } else {
            console.log('Unable to get team.')
        }
    }
    console.log(` ${colors.reset} END ==============================================================`);
}

export async function getPlayerPrevBids(id_bwngr, db) {
    await TransfersDAO.injectDB(db);
    await ManagersDAO.injectDB(db);
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    const bids = await TransfersDAO.getBid({player: id_bwngr}, {projection: {_id:0, manager:1 , overprice: 1}});
    const groupedByManager = bids.reduce(groupByManager,{});
    const keysArray = Object.keys(groupedByManager);
    keysArray.length && console.log('Previous bids for this player:');
    keysArray.forEach(key => {
        const managerProjection = groupedByManager[key];
        const managerName = managers.filter(man => man.id_bwngr === parseInt(key))[0]['name']
        console.log(`${colors.reset} manager: ${managerName} ${colors.black} ---- ${colors.green} avg bid overprice: ${formatToCurrency(managerProjection.totalCash/managerProjection.bidsAmount)} ---- total bids: ${managerProjection.bidsAmount} ${colors.reset}`)
    })
}