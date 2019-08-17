import {adjustByBonus} from './managersOperations';
import {executeASyncFunc} from '../../utils/common';

const [league] = process.argv.slice(2);

if(league){
    console.log('league:',league)
    executeASyncFunc(adjustByBonus,league);
}else{
    console.log('missing params, using pl by default');
    executeASyncFunc(adjustByBonus);
}