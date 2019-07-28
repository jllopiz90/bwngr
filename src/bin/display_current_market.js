'use strict';
import { getMarket } from '../modules/market';

const [league] = process.argv.slice(2);

if(!league) {
    console.log('params missing using la liga by default');
    getMarket()
}else {
    console.log(`using liga ${league}`);
    getMarket(league)
}