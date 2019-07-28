import { colors } from './utils';

export const dbs = {
    'test': process.env.BWNGR_DB_TEST,
    'liga': process.env.BWNGR_DB,
    'pl': process.env.BWNGR_DB_PL
};

export function handleError(e, action) {
    console.error(`${colors.reset} ${colors.red} ${action} =====Error: ${String(e)}`);
    console.error(`=====Error stack: ${e.stack} ${colors.reset}`);
}