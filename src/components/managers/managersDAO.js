import { handleError } from '../../utils/common';
let managers;

export default class ManagersDAO {
  static async injectDB(db) {
    if (managers) {
      return;
    }
    try {
      managers = await db.collection("managers");
    } catch (e) {
      handleError(e, 'Unable to establish collection handles in managersDAO');
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
      return await cursor.toArray();
    } catch (e) {
      handleError(e, 'Unable to get manager');
    }
    return false;
  }

  /**
   * Adds a manager to the `managers` collection
   * @param {ManagerInfo} ManagerInfo - The information of the user to add
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async addManager(ManagerInfo) {
    try {
      const { result: { result } } = await managers.insertOne(ManagerInfo);
      return result.ok === 1 && result.n === 1;
    } catch (e) {
      handleError(e, 'Error ocurred while inserting a manager');
    }
    return false;
  }

  /**
   * Remoev a manager from the `managers` collection.
   * @param {name} name -The id of the amnager to delete
   */
  static async deleteManager(name) {
    try {
      await managers.deleteOne({ name });
      const findingManager = await this.getManager(name);
      if (!findingManager || !findingManager.length) {
        return true;
      } else {
        handleError(e, 'Problem deleting manager');
      }
      return false;
    } catch (e) {
      handleError(e, 'Error ocurred while deleting a manager')
    }
    return false;
  }

  /**
   * Inserts manager into the `managers` collection in bulk operation
   * @param {ManagersInfo} - The info of the managers to insert
   */
  static async  insertManagersBulk(managersInfo) {
    try {
      const insertOperations = managersInfo.map((managerInfo) => ({ insertOne: { 'document': managerInfo } }));
      const result = await managers.bulkWrite(insertOperations);
      return result.insertedCount === managersInfo.length;
    } catch (e) {
      handleError(e, 'Error ocurred while inserting in bulk.');
    }
    return false;
  }

  static async setBalanceAllPlayers(amount) {
    try {
      const amountToUpdate = await managers.find({ balance: { "$ne": parseInt(amount) } }).count();
      const { result } = await managers.updateMany(
        {},
        {
          $set: { balance: parseInt(amount) }
        }
      );
      return result.nModified === amountToUpdate && result.ok === 1;
    } catch (e) {
      handleError(e, 'Error ocurred while seting balance for all managers');
    }
    return false;
  }

  static async setBalancePlayer({ amount, id_bwngr }) {
    try {
      const { result } = await managers.updateOne(
        { id_bwngr: parseInt(id_bwngr) },
        {
          $set: { balance: parseInt(amount) }
        }
      );
      return result.nModified === 1 && result.ok === 1;
    } catch (e) {
      handleError(e, `Unable to set balance for player with id_bwngr ${id_bwgnr}.`);
    }
    return false;
  }

  static async modifyBalance(amount, id_bwngr) {
    try {
      const { result } = await managers.updateOne(
        { id_bwngr: parseInt(id_bwngr) },
        {
          $inc: { balance: amount }
        }
      );
      return result.nModified === 1 && result.ok === 1;
    } catch (e) {
      handleError(e, `Unable to modify balance for player with id_bwngr ${id_bwngr}.`);
    }
    return false;
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