import { colors } from '../utils/utils';
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
   * Finds a manager in the `managers` collection (can be used to get multiple managers as well)
   * @param {string} name - The name of the desired manager
   * @returns {Object | null} Returns either a single manager or nothing
   */
  static async getManager(filter = {}, projection = {}) {
    try {
      const cursor = await managers.find(filter, projection);
      return cursor ? cursor.toArray() : { success: false };
    } catch (e) {
      console.error(`${colors.red} Unable to get manager.--Error: ${String(e)}`); 
      console.error(`Error Stack: ${String(e.stack)} ${colors.reset}`); 
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
      console.error(`${colors.red} Error ocurred while inserting a manager.-- ${e} ${colors.reset}`);
      if(String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { success: false, message: "A manager with the given name already exists." };
      }
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
        console.log(`${colors.reset} Error ocurred while insedeletingrting a manager.-- ${e}`);
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
      return result.insertedCount === managersInfo.length;
    }catch(e) {
      console.log(`${colors.red} Error ocurred while inserting in bulk.-- ${e} ${colors.reset}`);
      return false; 
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

  static async modifyBalance(amount, id_bwngr) {
    try {
      const { result } =  await managers.updateOne(
        {id_bwngr: parseInt(id_bwngr)},
        {
          $inc: { balance: amount }
        }
      );
      return {
        success: result.nModified === 1 && result.ok === 1
      };
    } catch (e) {
      console.log(` Unable to modify balance for player with id_bwngr ${id_bwngr}.Error-- ${String(e)}`);
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