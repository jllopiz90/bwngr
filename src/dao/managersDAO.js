let managers;

export default class ManagersDAO {
    static async injectDB(db) {
      if (managers) {
        return;
      }
      try {
        managers = await db.collection("managers");
      } catch (e) {
        console.error(`Unable to establish collection handles in managersDAO: ${e}`);
      }
    }

     /**
   * Finds a manager in the `managers` collection
   * @param {string} name - The name of the desired manager
   * @returns {Object | null} Returns either a single manager or nothing
   */
  static async getManager(filter = {}, projection = {}) {
    try {
      return {
        success: true,
        message: await managers.find(filter, projection)
      }
    } catch (e) {
      console.error(`\x1b[31m Unable to get manager.--Error: ${String(e)}`); 
      console.error(`--Error Stack: ${String(e.stack)} \x1b[0m`); 
      return {
        success: false,
        message: 'Unable to get manager'
      }
    }
  }

  /**
   * Adds a manager to the `managers` collection
   * @param {ManagerInfo} ManagerInfo - The information of the user to add
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async addManager(ManagerInfo) {
    try {
      let result = await managers.insertOne(ManagerInfo);
      result = result.result;
      return {success : result.ok === 1 && result.n === 1 , message: 'Manager added sucesfully.'};
    } catch (e) {
      if(String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A manager with the given name already exists." };
      }
      console.error(`Error ocurred while inserting a manager.-- ${e}`);
      return {success: false, message: String(e)};
    }
  }

  /**
   * Remoev a manager from the `managers` collection.
   * @param {name} name -The id of the amnager to delete
   */
  static async deleteManager(name) {
    try{
        await managers.deleteOne({name});
        if (!(await this.getManager(name))) {
            return { success: true };
          } else {
            console.error(`Deletion unsuccessful`);
            return { error: `Deletion unsuccessful` };
          }
    } catch(e) {
        console.error(`Error ocurred while insedeletingrting a manager.-- ${e}`);
        return {success: false, message: String(e)}; 
    }   
  }

  /**
   * Inserts manager into the `managers` collection in bulk operation
   * @param {ManagersInfo} - The info of the managers to insert
   */
  static async  insertManagersBulk(managersInfo) {
    try{
      const insertOperations = managersInfo.map(( managerInfo ) => {
        return { insertOne: { 'document': managerInfo}}
      });
      const result = await managers.bulkWrite(insertOperations);
      console.log(result)
      return {success: result.insertedCount === managersInfo.length}
    }catch(e) {
      console.error(`Error ocurred while inserting in bulk.-- ${e}`);
      return {success: false, message: String(e)}; 
    }
  }

  static async setBalanceAllPlayers(amount) {
    try{
      const amountToUpdate = await managers.find({balance: {"$ne": parseInt(amount)}}).count();
      const { result } = await managers.updateMany(
        {},
        {
          $set:{ balance: parseInt(amount) }
        }
      );
      return {
        success: result.nModified === amountToUpdate && result.ok === 1
      }; 
    }catch(e) {
      console.error(`Error ocurred while seting balance for all managers.Error-- ${String(e)}`);
      return {success: false, message: String(e)}; 
    }
  }

  static async setBalancePlayer({amount, id_bwngr}) {
    try {
      const { result } =  await managers.updateOne(
        {id_bwngr: parseInt(id_bwngr)},
        {
          $set:{ balance: parseInt(amount) }
        }
      );
      return {
        success: result.nModified === 1 && result.ok === 1
      };
    } catch (e) {
      console.error(`Unable to set balance for player with id_bwngr ${id_bwgnr}.Error-- ${String(e)}`);
      return {success: false, message: String(e)};
    }
  }
}

/**
 * Parameter passed to addManager method
 * @typedef ManagerInfo
 * @property {string} ManagerInfo
 */

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */