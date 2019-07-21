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

    static async insertTransfersBulk(transfersInfo) {
        try {
            // const insertOperations = transfersInfo.map( elem => {
            //     return {insertOne: {'document': elem}};
            // });
            const upsertOperations = transfersInfo.map( elem => 
                ({ updateOne: { 
                    filter: { type: elem.type, player: elem.player, moveFrom: elem.moveFrom, moveTo: elem.moveFrom, date: elem.date}, 
                    update: { $set: {amount: elem.amount} }, upsert: true } 
                 })
            );
            const result = await transfers.bulkWrite(upsertOperations);
            return {
                success: result.ok === 1,
                message: 'Transactions added.'
            }
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while inserting transactions.Error-- ${String(e)}`,'\x1b[0m')
            console.log('\x1b[31m',`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
            return {success: false, message: 'Unable to insert transfers.'};
        }
    }

    static async insertBidsBulk(BidsInfo) {
        try {
            // const insertOperations = BidsInfo.map( elem => {
            //     return {insertOne: {'document': elem}};
            // });
            const upsertOperations = BidsInfo.map( elem => 
                ({ updateOne: { 
                    filter: { player: elem.player, manager: elem.manager, amount: elem.amount, date: elem.date}, 
                    update: { $set: elem }, upsert: true } 
                 })
            );
            const result = await bids.bulkWrite(upsertOperations);
            return {
                success: result.ok === 1,
                message: 'Bids added.'
            }
        } catch (e) {
            console.log('\x1b[31m',`A problem ocurred while inserting bids.Error-- ${String(e)}`)
            console.log(`.Error Stack-- ${String(e.stack)}`,'\x1b[0m')
            return {success: false, message: 'Unable to insert bids.'};
        }
    }
}