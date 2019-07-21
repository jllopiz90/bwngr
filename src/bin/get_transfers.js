'use strict';
require("dotenv").config();
import 'core-js/stable';
import moment from 'moment';
import GetLeagueData from '../requests/getLeagueData';
import PlayersDAO from '../dao/playersDAO';
import TransfersDAO from '../dao/transfersDAO';
import { MongoClient } from "mongodb";

let [league,date = false] = process.argv.slice(2);
const date_moment = date ? moment(date).format('MM-DD-YYYY') : moment().format('MM-DD-YYYY');
const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};
const mapTransactionsName = {
    'transfer': 'sale',
    'market': 'purchase',
    'loan' : 'loan'
};

const has = Object.prototype.hasOwnProperty;

const getFormattedDeals = async deals => {
    const formattedDeals = []; 
    const bids = [];
    for(let i = 0; i < deals.length; i++) {
        for(let j = 0; j < deals[i].content.length; j++) {
            const date = moment.unix(deals[i].date).format('MM-DD-YYYY');
            formattedDeals.push({
                type: mapTransactionsName[deals[i].type],
                player: deals[i].content[j].player,
                moveFrom: has.call(deals[i].content[j],'from') ? deals[i].content[j].from.id : 'market',
                moveTo: has.call(deals[i].content[j],'to') ? deals[i].content[j].to.id : 'market', 
                amount: deals[i].content[j].amount,
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

const  getTransfers = async league => {
    if(!league) league = 'liga'
    const handleLeage = new GetLeagueData(league);
    const {message: deals} = await handleLeage.getTransactions(0,20);
    let dealsFiltered =  deals.filter( deal => {
        return moment.unix(deal.date).format('MM-DD-YYYY') === date_moment
    });
    let client;
    try {
        client = await MongoClient.connect(process.env.BWNGR_DB_URI, { useNewUrlParser: true });   
        const db = client.db(dbs[league]);
        await PlayersDAO.injectDB(db);
        await TransfersDAO.injectDB(db);
        const [formattedDeals, bids] = await getFormattedDeals(dealsFiltered);
        let result = formattedDeals.length ? await TransfersDAO.insertTransfersBulk(formattedDeals) : 'no deals to insert';
        console.log('deals insert status: ',result);
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
        result = bids.length ? await TransfersDAO.insertBidsBulk(bids) : 'no bids to insert';
        console.log('bids insert status: ',result);
        client.close();
    } catch (e) {
        console.error('=====Error:', e.toString());
        console.error('=====Error stack:', e.stack);
        client.close()
        process.exit(1)
    }
}

if(!league){
    console.log('missing params using la liga by default');
    console.log('date is', date_moment);
    getTransfers();
} else {
    console.log('using liga: ', league);
    console.log('date is', date_moment);
    getTransfers(league);
}