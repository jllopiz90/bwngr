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
   * @param {string} name - The name of the desired manager
   * @returns {Object | null} Returns either a single manager or nothing
   */
  static async getManager(name) {
    try {
      return await managers.findOne({ name });
    } catch (error) {
     console.error(`Unable to get manager.--Error: ${String(e)}`); 
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