'use strict';
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import { MongoClient } from "mongodb";
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import TransfersDAO from '../dao/transfersDAO';
import ManagersDAO from '../dao/managersDAO';
import { groupingBy, colors } from '../utils/utils';
import { has } from '../utils/objectCallers';
import { dbs, handleError } from '../utils/common';

const mapTransactionsName = {
    'transfer': 'sale',
    'market': 'purchase',
    'loan': 'loan'
};
const groupByManager = (groupKeys, currentRow) => groupingBy('manager', 'amount', groupKeys, currentRow);

export default async function getTransfers(date_moment, league = 'liga') {
    const handleLeage = new GetLeagueData(league);
    const { data: { data } } = await handleLeage.getTransactions(0, 20);
    let dealsFiltered = data.filter(deal => moment.unix(deal.date).format('MM-DD-YYYY') === date_moment);
    let client;
    try {
        client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });
        const db = client.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        await TransfersDAO.injectDB(db);
        await ManagersDAO.injectDB(db);
        const [formattedDeals, bids] = await getFormattedDeals(dealsFiltered);
        let result = formattedDeals.length ? await TransfersDAO.insertTransfersByDate(formattedDeals, date_moment) : 'no deals to insert';
        console.log('deals insert status: ', result);
        if (!result.success || result === 'no deals to insert') {
            client.close();
            return;
        }
        console.log('before update managers');
        await updateManagers(formattedDeals);
        console.log('after update managers');
        console.log('before update players ownership');
        await updatePlayersOwnership(formattedDeals);
        console.log('after update players ownership');
        const formattedAndFilteredDeals = formattedDeals.filter(deal => deal.type === 'purchase');
        for (let i = 0; i < formattedAndFilteredDeals.length; i++) {
            const deal = formattedAndFilteredDeals[i];
            const [{ price }] = await PlayersDAO.getPlayerCurrentPrice(parseInt(deal.player));
            bids.push({
                player: deal.player,
                manager: deal.moveTo,
                amount: deal.amount,
                overprice: deal.amount - price,
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
        client.close();
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
                type: mapTransactionsName[deals[i].type],
                player: deals[i].content[j].player,
                moveFrom: from,
                moveTo: to,
                amount: deals[i].content[j].amount,
                unix_time: deals[i].date,
                date
            });
            if (has.call(deals[i].content[j], 'bids')) {
                const result = await PlayersDAO.getPlayerCurrentPrice({ id_bwngr: parseInt(deals[i].content[j].player) }, { projection: { _id: 0, price: 1 } });
                const [{ price }] = result.length > 0 ? result : [{ price: 0 }];
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