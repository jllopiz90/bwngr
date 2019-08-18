import { handleError } from "../../utils/common";

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

    static async destroyCollection(){
        teams = null;
      }

    static async getTeam(filter, projection){
        try {
            const cursor = await teams.find(filter, projection);
            return cursor.toArray();
        } catch (e) {
            handleError(e,`Unable to get Team wth id ${id_bwngr}`);
        }
        return false;
    }

    static async addTeam(teamInfo){
        try {
            const { result: result } = await teams.insertOne(teamInfo);
            return result.ok ===1 && result.n === 1;
        } catch (e) {
            handleError(e,'Unable to add Team.');
        }
        return false;
    }

    static async insertTeamsBulk(teamsInfo) {
        try {
            const insertOperations = teamsInfo.map( elem => {
                return {insertOne: {'document': elem}};
            });
            const result = await teams.bulkWrite(insertOperations);
            return result.insertedCount === teamsInfo.length;
        } catch (e) {
            handleError(e,'Unable to insert teams in bulk');
            return false;
        }   
    }
}