import {adjustByBonus} from './managersOperations';
import {executeAsyncFunc} from '../../utils/common';

const [league] = process.argv.slice(2);

if(league){
    console.log('league:',league)
    executeAsyncFunc(adjustByBonus,league);
}else{
    console.log('missing params, using pl by default');
    executeAsyncFunc(adjustByBonus);
}