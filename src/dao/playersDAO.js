let players;

export default class PlayersDAO {
    static async injectDB(db) {
        if(players)
            return;
        try{
            players = await db.collection('players');
        } catch(e) {
            console.error(`Unable to establish collection handles in playersDAO: ${e}`);
        }
    }

    static async getPlayer(filter = {}, projection = {}) {
        try {
            const cursor = players.find(filter, projection);
            return cursor && cursor.toArray();
        } catch (e) {
            console.log('\x1b[31m',`Unable to get player.Erorr-- ${String(e)}`,'\x1b[0m');
            return {success: false, message: 'Unable to get player.'};
        }
    }

    static async getPlayerCurrentPrice(id_bwngr) {
        try {
            const cursor = await players.find({id_bwngr}, { projection: { _id: 0, price: 1 } });
            return cursor ? cursor.toArray() : { success: false };
        } catch (e) {
            console.log('\x1b[31m',`Unable to get player.Erorr-- ${String(e)}`,'\x1b[0m');
            return {success: false, message: 'Unable to get player price.'};
        }
    }

    static async addPlayer(playerInfo) {
        try {
            const { result: result } = await players.insertOne(playerInfo);
            return {
                success: result.ok === 1 && result.n === 1, 
                message: 'Player added.'
            };
        } catch (e) {
            console.error(`Unable to add the player.Error-- ${String(e)}`);
            return {success: false, message: 'Unable to add player.'};
        }
    }

    static async deletePlayer(id) {
        try {
            await players.deleteOne({id_bwngr: id});
            if(!(await this.getPlayer(id))){
                return {success: true, message: 'Player removed'};
            }
        } catch (e) {
            console.error(`Unable to delete player.Error-- ${String(e)}`);
            return {success: false, message: 'Unable to delete player.'};
        }
    }

    static async insertPlayersBulk(playersInfo) {
        try {
            const existingIDs = await this.getAllIDs();
            const notExistOnes = playersInfo.filter( player => !existingIDs.some( elem => elem.id_bwngr === player.id_bwngr));
            const insertOperations = notExistOnes.map( player => ({ 
                insertOne: { 'document': player}
            }));
            const result = insertOperations.length ? await players.bulkWrite(insertOperations) : false;
            return result && result.ok === 1;   
        } catch (e) {
            console.log('\x1b[31m',`Unable to bulk insert players.Error-- ${String(e)}`);
            console.log(`Erorr Stack-- ${String(e.stack)}`,'\x1b[0m');
            throw e;
        }
    }

    static async getAllIDs() {
        try {
            const cursor = players.find({}, {projection: {_id: 0, id_bwngr: 1}});
            return cursor ? await cursor.toArray() : [];
        } catch (e) {
            console.error('\x1b[31m',`Unable to get all ids.Error-- ${String(e)}`);
            console.log(`Erorr Stack-- ${String(e.stack)}`,'\x1b[0m');
            return [];
        }
    }

    static async updatePrice(playersPrice) {
        try {
            const updateOperations = playersPrice.map( ({id_bwngr, price, price_increment}) => ({
                updateOne: { 
                    filter: { id_bwngr }, 
                    update: { $set: { price, price_increment } }
                }
            }));
            const result = updateOperations.length ? await players.bulkWrite(updateOperations) : false;
            return result && result.ok === 1
        } catch (e) {
            console.error(`Unable to increment price for player with id_bwngr ${id_bwngr}.Error-- ${String(e)}`);
            throw e;
        }
    }

    static async updatePlayersOwnership(deals) {
        try {
            const updateOperations = [];
            for (let i = 0; i < deals.length; i++) {
                const deal = deals[i];
                const [player] = await this.getPlayer({id_bwngr: deal.player}, {projection: {_id: 0, own_since: 1}});
                if(deal.time > player.own_since) {
                    updateOperations.push({
                        updateOne: { 
                            filter: { id_bwngr: deal.player }, 
                            update: { $set: { owner: deal.new_owner, own_since: deal.time } }
                        }
                    });
                }
            }
            let result = {ok: -1};
            if(updateOperations.length) {
                result =  await players.bulkWrite(updateOperations);
            }
            return {
                success: result.ok === 1,
                message: result.ok === 1 ? 'Onwerships updated!' : 'Onwerships were not updated.'
            };
        } catch (e) {
            console.error(`Unable to update ownerships.Error-- ${String(e)}`);
            return {success: false, message: String(e)};
        }
    }
}