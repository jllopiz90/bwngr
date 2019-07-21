'use stric';
let transfers;
let bids;

export default class TransfersDAO {
    static async injectDB(db) {
        if(transfers && bids) return;
        try {
            if(!transfers && !bids) {
                transfers = await db.collection('transactions');
                bids = await db.collection('bids')
            } else {
                transfers ? bids = await db.collection('bids') : transfers = await db.collection('transactions');   
            }
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while getting collections.Error; ${String(e)}`,'\x1b[0m');
            console.log('\x1b[31m',`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
        }
    };

    static async getTransaction(filter, projection) {
        try {
            const cursor = await transfers.find(filter, projection);
            return cursor ? cursor.toArray() : { found: false };
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while getting transactions.Error-- ${String(e)}`,'\x1b[0m');
            console.log('\x1b[31m',`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
            return {success: false, message: 'Unable to get transfers.'};
        }
    }

    static async getBid(filter, projection) {
        try {
            const cursor = await bid.find(filter, projection);
            return cursor ? cursor.toArray() : { found: false };
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while getting bids.Error-- ${String(e)}`,'\x1b[0m');
            console.log('\x1b[31m',`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
            return {success: false, message: 'Unable to get bids.'};
        }
    }

    static async insertTransfersByDate(transfersInfo, date) {
        try {
            await transfers.removeMany({date});
            const insertOperations = transfersInfo.map( elem => {
                return {insertOne: {'document': elem}};
            });
            const result = await transfers.bulkWrite(insertOperations);
            return {
                success: result.insertedCount === transfersInfo.length,
                message: 'Transactions added.'
            }
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while inserting transactions.Error-- ${String(e)}`,'\x1b[0m')
            console.log('\x1b[31m',`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
            return {success: false, message: 'Unable to insert transfers.'};
        }
    }

    static async insertBidsByDate(bidsInfo, date) {
        try {
            await bids.removeMany({date});
            const insertOperations = bidsInfo.map( elem => {
                return {insertOne: {'document': elem}};
            });
            const result = await bids.bulkWrite(insertOperations);
            return {
                success: result.insertedCount === bidsInfo.length,
                message: 'Bids added.'
            }
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while inserting bids.Error-- ${String(e)}`)
            console.log(`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
            return {success: false, message: 'Unable to insert bids.'};
        }
    }
}