import { handleError } from "../../utils/common";

let transfers;
let bids;

export default class TransfersDAO {
    static async injectDB(db) {
        if (transfers && bids) return;
        try {
            if (!transfers && !bids) {
                transfers = await db.collection('transactions');
                bids = await db.collection('bids')
            } else {
                transfers ? bids = await db.collection('bids') : transfers = await db.collection('transactions');
            }
        } catch (e) {
            handleError(e, 'A problem ocurred while getting collections');
        }
    };

    static async getTransaction(filter = {}, projection = {}) {
        try {
            const cursor = await transfers.find(filter, projection);
            return await cursor.toArray();
        } catch (e) {
            handleError(e, 'A problem ocurred while getting transactions.');
        }
        return false;
    }

    static async getBid(filter, projection) {
        try {
            const cursor = await bids.find(filter, projection);
            return await cursor.toArray();
        } catch (e) {
            handleError(e, 'A problem ocurred while getting bids.');
        }
        return false;
    }

    static async insertTransfersByDate(transfersInfo) {
        try {
            // await transfers.removeMany({ date });
            const insertOperations = transfersInfo.map(elem => {
                return { insertOne: { 'document': elem } };
            });
            const result = await transfers.bulkWrite(insertOperations);
            return result.insertedCount === transfersInfo.length;
        } catch (e) {
            handleError(e, 'A problem ocurred while inserting transactions');
        }
        return false;
    }

    static async insertBidsByDate(bidsInfo, date) {
        try {
            await bids.removeMany({ date });
            const insertOperations = bidsInfo.map(elem => {
                return { insertOne: { 'document': elem } };
            });
            const result = await bids.bulkWrite(insertOperations);
            return result.insertedCount === bidsInfo.length;
        } catch (e) {
            handleError(e, 'A problem ocurred while inserting bids');
        }
        return false;
    }
}