'use strict';
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

    static async getPlayer(id_bwngr) {
        try {
            return players.findOne({id_bwngr: parseInt(id_bwngr)});
        } catch (e) {
            console.error(`Unable to get player.Erorr-- ${String(e)}`);
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

    static async upsertPlayersBulk(playersInfo) {
        try {
            const upsertOperations = playersInfo.map( elem => 
                ({ updateOne: { 
                    filter: { id_bwngr: elem.id_bwngr}, 
                    update: { $set: elem }, upsert: true } 
                 })
            );
            const result = await players.bulkWrite(upsertOperations);
            return {success: result.ok === 1, message: 'Players upserted!'};   
        } catch (e) {
            console.error(`Unable to bulk insert players.Error-- ${String(e)}`);
            return {success: false, message: 'Unable to bulk insert players'};
        }
    }

    static async updatePrice({id_bwngr, increment}) {
        try {
            const  { result }  = await players.updateOne(
                {id_bwngr: parseInt(id_bwngr) },
                {$inc: { price: parseInt(increment) }}
            );
            return {
                success: result.nModified === 1 && result.ok === 1
            };
        } catch (e) {
            console.error(`Unable to increment price for player with id_bwngr ${id_bwngr}.Error-- ${String(e)}`);
            return {success: false, message: String(e)};
        }
    }
}