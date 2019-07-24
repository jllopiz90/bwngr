'use strict';
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import { MongoClient } from "mongodb";
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import TransfersDAO from '../dao/transfersDAO';
import ManagersDAO from '../dao/managersDAO';
import { groupingBy } from '../utils/utils';
import { has }  from '../utils/objectCallers';
import { dbs } from '../utils/common';

const mapTransactionsName = {
    'transfer': 'sale',
    'market': 'purchase',
    'loan' : 'loan'
};

export default async function getTransfers(date_moment, league = 'liga') {
    const handleLeage = new GetLeagueData(league);
    const {message: deals} = await handleLeage.getTransactions(0,20);
    let dealsFiltered =  deals.filter( deal => moment.unix(deal.date).format('MM-DD-YYYY') === date_moment);
    let client;
    try {
        client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });   
        const db = client.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        await TransfersDAO.injectDB(db);
        await ManagersDAO.injectDB(db);
        const [formattedDeals, bids] = await getFormattedDeals(dealsFiltered);
        let result = formattedDeals.length ? await TransfersDAO.insertTransfersByDate(formattedDeals,date_moment) : 'no deals to insert';
        console.log('deals insert status: ',result);
        if(result.success) {
           await updateManagersAndPlayers(formattedDeals);
        }
        const formattedAndFilteredDeals = formattedDeals.filter(deal => deal.type === 'purchase');
        for (let i = 0; i < formattedAndFilteredDeals.length; i++) {
            const deal = formattedAndFilteredDeals[i];
            const [{price}] = await PlayersDAO.getPlayerCurrentPrice({id_bwngr: parseInt(deal.player)}, {projection: {_id: 0, price: 1}});
            bids.push({
                player: deal.player,
                manager: deal.moveTo,
                amount: deal.amount,
                overprice: deal.amount - price,
                date: deal.date
            });
        }
        result = bids.length ? await TransfersDAO.insertBidsByDate(bids,date_moment) : 'no bids to insert';
        console.log('bids insert status: ',result);
        client.close();
        console.log('done')
    } catch (e) {
        console.error('\x1b[31m =====Error:', e.toString());
        console.error('\x1b[31m =====Error stack:', e.stack);
        client.close()
        process.exit(1)
    }
}

async function getFormattedDeals(deals) {
    const formattedDeals = []; 
    const bids = [];
    for(let i = 0; i < deals.length; i++) {
        for(let j = 0; j < deals[i].content.length; j++) {
            const date = moment.unix(deals[i].date).format('MM-DD-YYYY');
            const from = has.call(deals[i].content[j],'from') ? deals[i].content[j].from.id : 'market';
            const to = has.call(deals[i].content[j],'to') ? deals[i].content[j].to.id : 'market';
            formattedDeals.push({
                type: mapTransactionsName[deals[i].type],
                player: deals[i].content[j].player,
                moveFrom: from,
                moveTo: to, 
                amount: deals[i].content[j].amount,
                unix_time: deals[i].date,
                date
            });
            if( has.call(deals[i].content[j],'bids') ) { 
                const [{price}] = await PlayersDAO.getPlayerCurrentPrice({id_bwngr: parseInt(deals[i].content[j].player)}, {projection: {_id: 0, price: 1}});
                deals[i].content[j].bids.forEach( bid => {
                    bids.push({
                        player: deals[i].content[j].player,
                        manager: bid.user.id,
                        amount: bid.amount,
                        overprice: parseInt(bid.amount) - price,
                        date
                    });
                });
            };
        }
    }
    return [formattedDeals, bids];
}

async function updateManagersAndPlayers(formattedDeals) {
    const salesFormatted = formattedDeals.filter( deal => deal.type === 'sale').map( sale => ({manager: sale.moveFrom, amount: sale.amount}));
    const purchasesFormatted = formattedDeals.filter( deal => deal.type === 'purchase').map( purchase => ({manager: purchase.moveTo, amount: sale.amount}));
    formattedDeals.filter( deal => deal.type === 'sale' && deal.moveTo !== 'market')
                .map( deal => ({manager: deal.moveTo, amount: deal.amount}))
                .forEach( element => {
                    purchasesFormatted.push(element);  
                });
    const purchasesGrouped = purchasesFormatted.reduce(groupByManager, {});
    const salesGrouped = salesFormatted.reduce(groupByManager, {});

    const salesKeys = Object.keys(salesGrouped);
    const purchasesKeys = Object.keys(purchasesGrouped);
    for (let i = 0; i < purchasesKeys.length; i++) {
        const manager = purchasesKeys[i];
        const amount = parseInt(purchasesGrouped[manager]);
        await ManagersDAO.modifyBalance(0 - amount,manager);
    }
    for (let i = 0; i < salesKeys.length; i++) {
        const manager = salesKeys[i];
        const amount = parseInt(salesGrouped[manager]);
        await ManagersDAO.modifyBalance(amount,manager);
    }
}

const groupByManager = (groupKeys, currentRow) => groupingBy('manager','amount',groupKeys, currentRow);