'use strict';
let teams;

export default class TeamsDAO{
    static async injectDB(db){
        if(teams){
            return;
        }
        try {
            teams = await db.collection('teams');
        } catch (e) {
            console.error(`Unable to establish collection handles in playersDAO: ${e}`);
        }
    }

    static async getTeam(id_bwngr){
        try {
            const team = await teams.findOne({id_bwngr:parseInt(id_bwngr)});
            return {
                success: true,
                message: team
            }
        } catch (e) {
            console.error(`Unable to get Team wth id ${id_bwngr}.--Error: ${String(e)}`)
            return {
                success: false,
                message: String(e)
            }
        }
    }

    static async addTeam(teamInfo){
        try {
            const { result: result } = await teams.insertOne(teamInfo);
            return {
                success: result.ok ===1 && result.n === 1,
                message: 'Team added'
            }
        } catch (e) {
            console.error(`Unable to add Team.--Error: ${String(e)}`)
            return {
                success: false,
                message: 'Unable to add Team.'
            }
        }
    }

    static async insertTeamsBulk(teamsInfo) {
        try {
            const insertOperations = teamsInfo.map( elem => {
                return {insertOne: {'document': elem}};
            });
            const result = await teams.bulkWrite(insertOperations);
            return {
                success: result.insertedCount === teamsInfo.length,
                message: 'Teams addded.'
            }
        } catch (e) {
            console.error(`Unable to insert teams in bulk.Error-- ${String(e)}`);
            return {
                success: false,
                message: 'Unable to insert teams in bulk.'
            }
        }   
    }
}