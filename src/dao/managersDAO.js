let managers;

export default class ManagersDAO {
    static async injectDB(conn) {
      if (managers) {
        return;
      }
      try {
        managers = await conn.db(process.env.BWNGR_DB).collection("managers");
      } catch (e) {
        console.error(`Unable to establish collection handles in managersDAO: ${e}`);
      }
    }

     /**
   * Finds a manager in the `managers` collection
   * @param {string} managerName - The name of the desired manager
   * @returns {Object | null} Returns either a single manager or nothing
   */
  static async getManager(managerName) {
    const result  = await managers.findOne({ managerName });
    return result;
  }

  /**
   * Adds a manager to the `managers` collection
   * @param {ManagerInfo} ManagerInfo - The information of the user to add
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async addManager(ManagerInfo) {
    try {
      let result = await managers.insertOne(ManagerInfo);
      console.log(result);
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
   * @param {_id} _id -The id of the anager to delete
   */
  static async deleteManager(managerName) {
    try{
        await managers.deleteOne({managerName});
        if (!(await this.getManager(managerName))) {
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
  static async insertManagersBulk(managersInfo) {
    try{
      console.log(managersInfo)
      const insertOperations = managersInfo.map(( managerInfo ) => {
        console.log(managerInfo)
        return { insertOne: { 'document': managerInfo}}
      });
      console.log(insertOperations)
      const result = await managers.bulkWrite(insertOperations);
      console.log('something')
      return {success: result.insertedCount === managersInfo.length}
    }catch(e) {
      console.error(`Error ocurred while inserting in bulk.-- ${e}`);
      return {success: false, message: String(e)}; 
    }
  }

}

/**
 * Parameter passed to addUser method
 * @typedef ManagerInfo
 * @property {string} ManagerInfo
 */

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */