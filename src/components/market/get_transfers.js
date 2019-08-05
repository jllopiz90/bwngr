'use strict';
import moment from 'moment';
import updateTransfers from './transfersConsoleOps';
import { has } from '../../utils/objectCallers';
import { dbs } from '../../utils/common';

let [arg1, arg2 = false] = process.argv.slice(2);
let date_moment;

if(arg1 && !has.call(dbs,arg1)){
    console.log('missing params using la liga by default');
    date_moment = moment(arg1).format('MM-DD-YYYY'); 
    console.log('date is', date_moment);
    updateTransfers(date_moment);
} else if(arg1 && !arg2)  {
    console.log('using liga: ', arg1);
    date_moment = moment().format('MM-DD-YYYY'); 
    console.log('date is', date_moment);
    updateTransfers(date_moment, arg1);
} else if(arg1 && arg2) {
    console.log('using liga: ', arg1);
    date_moment = moment(arg2).format('MM-DD-YYYY'); 
    console.log('date is', date_moment);
    updateTransfers(date_moment, arg1);
} else {
    console.log('missing params using la liga and today by default');
    date_moment = moment().format('MM-DD-YYYY'); 
    console.log('date is', date_moment);
    updateTransfers(date_moment);   
}