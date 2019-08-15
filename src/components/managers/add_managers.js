import initManagers from './managersConsoleOperations';

const [league] = process.argv.slice(2);

if(league){
    console.log('league:',league)
    initManagers(league);
}else{
    console.log('missing params, using pl by default');
    initManagers()
}