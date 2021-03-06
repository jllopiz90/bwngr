'use strict';
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import { MongoClient } from "mongodb";
import GetLeagueData from '../../requests/getLeagueData';
import TransfersDAO from './transfersDAO';
import PlayersDAO from '../players/playersDAO';
import ManagersDAO from '../managers/managersDAO';
import { groupingBy } from '../../utils/utils';
import { has } from '../../utils/objectCallers';
import { dbs, handleError } from '../../utils/common';

const mapTransactionsName = {
    'transfer': 'sale',
    'market': 'purchase',
    'loan': 'loan',
    'adminTransfer': 'sale'
};
const groupByManager = (groupKeys, currentRow) => groupingBy('manager', 'amount', groupKeys, currentRow);
const compareObj = (obj1, obj2) => Object.keys(obj1).length === Object.keys(obj2).length && Object.keys(obj1).every(key => has.call(obj2, key) && obj1[key] === obj2[key])

export default async function updateTransfers(date_moment, league = 'pl') {
    let client;
    try {
        const clientPromise = MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const handleLeage = new GetLeagueData(league);
        const { data: { data } } = await handleLeage.getTransactions(0, 500);
        console.log('players fetched from bwngr');
        client = await clientPromise;
        const db = client.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        let dealsFilteredByDate = data.filter(deal => moment.unix(deal.date).format('MM-DD-YYYY') === date_moment);
        const dealsPromise = getFormattedDeals(dealsFilteredByDate);
        await TransfersDAO.injectDB(db);
        await ManagersDAO.injectDB(db);
        const transfersFromDB = await TransfersDAO.getTransaction({date: date_moment},{projection: {_id: 0}});
        const [formattedDeals, bids] = await dealsPromise;
        const noInDBDeals = formattedDeals.filter(deal => !transfersFromDB.some(dealFromDB => compareObj(deal,dealFromDB)));
        let inserTransfersResult = noInDBDeals.length ? await TransfersDAO.insertTransfersByDate(noInDBDeals) : 'no deals to insert';
        console.log('deals insert status: ', inserTransfersResult);
        if (!inserTransfersResult || inserTransfersResult === 'no deals to insert') {
            client.close();
            return;
        }
        console.log('before update managers');
        await updateManagers(noInDBDeals);
        console.log('after update managers');
        console.log('before update players ownership');
        await updatePlayersOwnership(noInDBDeals);
        console.log('after update players ownership');
        const formattedAndFilteredDeals = noInDBDeals.filter(deal => deal.type === 'purchase');
        for (let i = 0; i < formattedAndFilteredDeals.length; i++) {
            const deal = formattedAndFilteredDeals[i];
            const price = await PlayersDAO.getPlayerCurrentPrice(parseInt(deal.player));
            bids.push({
                player: deal.player,
                manager: deal.moveTo,
                amount: deal.amount,
                overprice: deal.amount - price || 0,
                date: deal.date
            });
        }
        console.log('before insert bids')
        bids.length && await TransfersDAO.insertBidsByDate(bids, date_moment);
        console.log(bids.length ? 'after insert bids' : 'no bids to insert')
        client.close();
        console.log('done');
        return { success: true, message: 'All done!' };
    } catch (e) {
        handleError(e, 'Unable to update transfers');
        client && client.close();
        return { success: false, message: 'Something went wrong pal :(' };
    }
}

async function getFormattedDeals(deals) {
    const formattedDeals = [];
    const bids = [];
    for (let i = 0; i < deals.length; i++) {
        for (let j = 0; j < deals[i].content.length; j++) {
            const date = moment.unix(deals[i].date).format('MM-DD-YYYY');
            const from = has.call(deals[i].content[j], 'from') ? deals[i].content[j].from.id : 'market';
            const to = has.call(deals[i].content[j], 'to') ? deals[i].content[j].to.id : 'market';
            formattedDeals.push({
                type: mapTransactionsName[deals[i].type] || deals[i].type,
                player: deals[i].content[j].player,
                moveFrom: from,
                moveTo: to,
                amount: deals[i].content[j].amount,
                unix_time: deals[i].date,
                date
            });
            if (has.call(deals[i].content[j], 'bids')) {
                const price = await PlayersDAO.getPlayerCurrentPrice(parseInt(deals[i].content[j].player));
                price > 0 && deals[i].content[j].bids.forEach(bid => {
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

async function updateManagers(formattedDeals) {
    const salesFormatted = formattedDeals.filter(deal => deal.type === 'sale').map(sale => ({ manager: sale.moveFrom, amount: sale.amount }));
    const purchasesFormatted = formattedDeals.filter(deal => deal.type === 'purchase').map(purchase => ({ manager: purchase.moveTo, amount: purchase.amount }));
    formattedDeals.filter(deal => deal.type === 'sale' && deal.moveTo !== 'market')
        .map(deal => ({ manager: deal.moveTo, amount: deal.amount }))
        .forEach(element => {
            purchasesFormatted.push(element);
        });
    const purchasesGrouped = purchasesFormatted.reduce(groupByManager, {});
    const salesGrouped = salesFormatted.reduce(groupByManager, {});

    const salesKeys = Object.keys(salesGrouped);
    const purchasesKeys = Object.keys(purchasesGrouped);
    for (let i = 0; i < purchasesKeys.length; i++) {
        const manager = purchasesKeys[i];
        const amount = parseInt(purchasesGrouped[manager]);
        await ManagersDAO.modifyBalance(0 - amount, manager);
    }
    for (let i = 0; i < salesKeys.length; i++) {
        const manager = salesKeys[i];
        const amount = parseInt(salesGrouped[manager]);
        await ManagersDAO.modifyBalance(amount, manager);
    }
}

async function updatePlayersOwnership(formattedDeals) {
    const purchasesFormatted = formattedDeals.filter(purchase => purchase.type === 'purchase')
        .map(purchase => ({ player: purchase.player, new_owner: purchase.moveTo, time: purchase.unix_time }));
    const salesFormatted = formattedDeals.filter(sale => sale.type === 'sale')
        .map(sale => ({ player: sale.player, new_owner: sale.moveTo, time: sale.unix_time }));
    const moves = purchasesFormatted.concat(salesFormatted);
    moves.length && await PlayersDAO.updatePlayersOwnership(moves);
}