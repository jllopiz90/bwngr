'use strict';
require("dotenv").config();
import 'core-js/stable';
import { adjustPrice } from '../modules/players';
//run this script like this : npm run set_balance -- 25000000 1802949     (after -- the parameters)

const [league] = process.argv.slice(2);

if (league) {
    console.log(`using league ${league}`)
    adjustPrice(league);
} else {
    console.log('missing params using la liga by default');
    adjustPrice();
}

