'use strict';
import moment from 'moment';
import getTransfers from '../modules/transfers';
import { has } from '../utils/objectCallers';
import { dbs } from '../utils/common';

let [arg1, arg2 = false] = process.argv.slice(2);
let date_moment = arg2 ? moment(arg2).format('MM-DD-YYYY') : moment().format('MM-DD-YYYY');

if(arg1 && !has.call(dbs,arg1)){
    console.log('missing params using la liga by default');
    date_moment = moment(arg1).format('MM-DD-YYYY'); 
    console.log('date is', date_moment);
    getTransfers(date_moment);
} else {
    console.log('using liga: ', arg1);
    date_moment = moment(arg2).format('MM-DD-YYYY'); 
    console.log('date is', date_moment);
    getTransfers(date_moment, arg1);
}