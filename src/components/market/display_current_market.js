'use strict';
import { getMarket } from './marketConsoleOps';

const [league] = process.argv.slice(2);

if(!league) {
    console.log('params missing using pl by default');
    getMarket()
}else {
    console.log(`using liga ${league}`);
    getMarket(league)
}