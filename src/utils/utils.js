'use strict';

export const getUniqueValues = (array_container) => {
    const result = [];
    array_container.forEach(element => !result.includes(element) && result.push(element));
    return result;
}

export const groupingBy = (field, value, groupKeys, currentRow) => {
    groupKeys.hasOwnProperty(currentRow[field]) ? groupKeys[currentRow[field]] += parseInt(currentRow[value]) : groupKeys[currentRow[field]] = parseInt(currentRow[value]);
    return groupKeys;
}

export const groupingByWithCount = (field, value, groupKeys, currentRow) => {
    groupKeys[currentRow[field]] = groupKeys.hasOwnProperty(currentRow[field]) ? 
     {totalCash: groupKeys[currentRow[field]]['totalCash'] + parseInt(currentRow[value]), bidsAmount: groupKeys[currentRow[field]]['bidsAmount']  + 1}
    : {totalCash: parseInt(currentRow[value]), bidsAmount: 1}
    return groupKeys;
}

export  function formatToCurrency(number) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number);
}

export function isInt(value) {
    return Number.isInteger(parseInt(value));
}

export const colors = {
    reset: '\x1b[0m',

    //text color

    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    //background color

    blackBg: '\x1b[40m',
    redBg: '\x1b[41m',
    greenBg: '\x1b[42m',
    yellowBg: '\x1b[43m',
    blueBg: '\x1b[44m',
    magentaBg: '\x1b[45m',
    cyanBg: '\x1b[46m',
    whiteBg: '\x1b[47m'
}