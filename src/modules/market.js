'use strict';
import 'core-js/stable';
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import ManagersDAO from '../dao/managersDAO';
import { MongoClient } from 'mongodb';
import { formatToCurrency } from '../utils/utils';
import { dbs, handleError } from '../utils/common';
import { colors } from '../utils/utils';
require("dotenv").config();

export async function getMarket(league = 'liga') {
    try {
        const leagueHandler = new GetLeagueData(league);
        const promiseMarket = leagueHandler.getCurrentMarket();
        const promiseClient =  MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        const { data: { data: { sales } } } = promiseMarket ? await promiseMarket : {data:{data:{sales:[]}}};
        if(!sales.length){
            console.log('problem getting market from bwngr');
            const client = await promiseClient;
            client.close;
        } else {
            const salesFormatted = sales.map(sale => ({
                player: sale.player.id,
                price: sale.price
            }));
            const client = await promiseClient;
            const db =  client.db(dbs[league]);
            await PlayersDAO.injectDB(db);
            for (let i = 0; i < salesFormatted.length; i++) {
                const sale = salesFormatted[i];
                const result = await PlayersDAO.getPlayer({id_bwngr: sale.player}, {projection: {_id: 0, name: 1}})
                if(result) {
                    const [{name}] = result  ;
                    console.log(`${colors.reset} player: ${name} ${colors.black} ---- ${colors.green} price: ${formatToCurrency(sale.price)} ${colors.reset}`);
                } else {
                    console.log('player not foundm, id: ', sale.player)
                }
            }
            await getManagersState(db);
            client.close();
        }
    } catch (e) {
        handleError(e);
    }
}


// get balance, all players group by position value for each, total value and player amount for position, total total value and players amount, max bid
async function getManagersState(db) {
    await ManagersDAO.injectDB(db);
    const managers = await ManagersDAO.getManager({}, { projection: { _id: 0 } });
    console.log(`  ${colors.black} =======================================================`);
    console.log(`${colors.reset}MANAGERS STATE: `);
    for (let i = 0; i < managers.length; i++) {
        const { name, id_bwngr, balance } = managers[i];
        console.log(`Manager # ${i+1} - ${name} State:`);
        let gksValue = 0, dfsValue = 0, mfsValue = 0, stsValue = 0;
        const team = await PlayersDAO.getPlayer({ owner: id_bwngr }, { projection: { _id: 0, name: 1, position: 1, price: 1 } });
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
            const teamValue = gksValue + dfsValue + mfsValue + stsValue;
            console.log(`${colors.reset}Total team value: , ${colors.green} ${formatToCurrency(teamValue)}`);
            console.log(`${colors.reset}Total players amount: `, gks.length + dfs.length + mfs.length + sts.length);
            console.log(`${colors.reset}Manager Balance: ${colors.green} ${formatToCurrency(balance)}`);
            console.log(`${colors.reset}Manager Max Bid: ${colors.green} ${formatToCurrency(maxBid(balance, teamValue))}`);
            console.log(`${colors.black} =======================================================  ${colors.reset}`);
        } else {
            console.log('Unable to get team.')
        }
    }
    console.log(` ${colors.reset} END ==============================================================`);
}

const maxBid = (balance, teamValue) => balance + teamValue / 4;
