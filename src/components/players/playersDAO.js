import { handleError } from '../../utils/common';
let players;

export default class PlayersDAO {
    static async injectDB(db) {
        if (players)
            return;
        try {
            players = await db.collection('players');
        } catch (e) {
            handleError(e, 'Unable to establish collection handles in playersDAO');
        }
    }

    static async destroyCollection(){
        players = null;
      }

    static async getPlayer(filter = {}, projection = {}) {
        try {
            const cursor = players.find(filter, projection);
            return cursor.toArray();
        } catch (e) {
            handleError(e, 'Unable to get player');
        }
        return false;
    }

    static async getPlayerCurrentPrice(id_bwngr) {
        try {
            const cursor = players.find({ id_bwngr }, { projection: { _id: 0, price: 1 } });
            const result = await cursor.toArray();
            return result.length && result[0].price;
        } catch (e) {
            handleError(e, 'Unable to get player price.')
        }
        return false;
    }

    static async addPlayer(playerInfo) {
        try {
            const { result: result } = await players.insertOne(playerInfo);
            return result.ok === 1 && result.n === 1;
        } catch (e) {
            handleError(e, 'Unable to add the player');
        }
        return false;
    }

    static async deletePlayer(id) {
        try {
            await players.deleteOne({ id_bwngr: id });
            if (!(await this.getPlayer(id))) {
                return true;
            }
        } catch (e) {
            handleError('Unable to delete player');
        }
        return false;
    }

    static async insertPlayersBulk(playersInfo) {
        try {
            const existingIDs = await this.getAllIDs();
            const notExistOnes = playersInfo.filter(player => !existingIDs.some(elem => elem.id_bwngr === player.id_bwngr));
            const insertOperations = notExistOnes.map(player => ({
                insertOne: { 'document': player }
            }));
            const result = insertOperations.length ? await players.bulkWrite(insertOperations) : false;
            return result && result.ok === 1;
        } catch (e) {
            handleError(e, 'Unable to bulk insert players');
        }
        return false;
    }

    static async getAllIDs() {
        try {
            const cursor = players.find({}, { projection: { _id: 0, id_bwngr: 1 } });
            return await cursor.toArray();
        } catch (e) {
            handleError(e, 'Unable to get all ids');
        }
        return [];
    }

    static async updatePrice(playersPrice) {
        try {
            const updateOperations = playersPrice.map(({ id_bwngr, price, price_increment }) => ({
                updateOne: {
                    filter: { id_bwngr },
                    update: { $set: { price, price_increment } }
                }
            }));
            const result = updateOperations.length ? await players.bulkWrite(updateOperations) : false;
            return result && result.ok === 1
        } catch (e) {
            handleError(e, `Unable to increment price for player with id_bwngr ${id_bwngr}`);
            return false;
        }
    }

    static async updatePlayersOwnership(deals) {
        try {
            const updateOperations = [];
            for (let i = 0; i < deals.length; i++) {
                const deal = deals[i];
                const [player] = await this.getPlayer({ id_bwngr: deal.player }, { projection: { _id: 0, own_since: 1 } });
                updateOperations.push({
                    updateOne: {
                        filter: { id_bwngr: deal.player },
                        update: { $set: { owner: deal.new_owner, own_since: deal.time } }
                    }
                });
            }
            let result = { ok: -1 };
            if (updateOperations.length) {
                result = await players.bulkWrite(updateOperations);
            }
            return result.ok === 1;
        } catch (e) {
            handleError(e, 'Unable to update ownerships');
        }
        return false;
    }
}