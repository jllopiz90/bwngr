let users
let sessions

export default class UsersDAO {
  static async injectDB(conn) {
    if (users && sessions) {
      return
    }
    try {
      users = await conn.db(process.env.BWNGR_DB).collection("users")
      sessions = await conn.db(process.env.BWNGR_DB).collection("sessions")
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`)
    }
  }

  /**
   * Finds a user in the `users` collection
   * @param {string} userName - The name of the desired user
   * @returns {Object | null} Returns either a single user or nothing
   */
  static async getUser(userName) {
    return await users.findOne({ userName: userName })
  }

  /**
   * Adds a user to the `users` collection
   * @param {UserInfo} userInfo - The information of the user to add
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async addUser(userInfo) {
    try {
      const { result } = await users.insertOne(userInfo,{writeConcern: {w: 'majority'}})
      return { success: result.ok === 1 && result.n === 1 }
    } catch (e) {
      if (String(e).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A user with the given name already exists." }
      }
      console.error(`Error occurred while adding new user, ${e}.`)
      return { error: e }
    }
  }

  /**
   * Adds a user to the `sessions` collection
   * @param {string} userName - The name of the user to login
   * @param {string} jwt - A JSON web token representing the user's claims
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async loginUser(userName, jwt) {
    try {
      // Use an UPSERT statement to update the "jwt" field in the document,
      // matching the "user_id" field with the userName passed to this function.
      const result = await sessions.updateOne(
        { user_id: userName },
        { $set: { jwt, user_id: userName } },
        { upsert: true}
      )
      return { success: result.ok === 1 && result.n === 1 }
    } catch (e) {
      console.error(`Error occurred while logging in user, ${e}`)
      return { error: e }
    }
  }

  /**
   * Removes a user from the `sessons` collection
   * @param {string} userName - The name of the user to logout
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async logoutUser(userName) {
    try {
      const result = await sessions.deleteOne({ user_id: userName })
      return { success: result.ok === 1 && result.n === 1 }
    } catch (e) {
      console.error(`Error occurred while logging out user, ${e}`)
      return { error: e }
    }
  }

  /**
   * Gets a user from the `sessions` collection
   * @param {string} userName - The name of the user to search for in `sessions`
   * @returns {Object | null} Returns a user session Object, an "error" Object
   * if something went wrong, or null if user was not found.
   */
  static async getUserSession(userName) {
    try {
      return sessions.findOne({ user_id: userName })
    } catch (e) {
      console.error(`Error occurred while retrieving user session, ${e}`)
      return null
    }
  }

  /**
   * Removes a user from the `sessions` and `users` collections
   * @param {string} userName - The name of the user to delete
   * @returns {DAOResponse} Returns either a "success" or an "error" Object
   */
  static async deleteUser(userName) {
    try {
      await users.deleteOne({ userName })
      await sessions.deleteOne({ user_id: userName })
      if (!(await this.getUser(userName)) && !(await this.getUserSession(userName))) {
        return { success: true }
      } else {
        console.error(`Deletion unsuccessful`)
        return { error: `Deletion unsuccessful` }
      }
    } catch (e) {
      console.error(`Error occurred while deleting user, ${e}`)
      return { error: e }
    }
  }

  static async checkAdmin(userName) {
    try {
      const { isAdmin } = await this.getUser(userName)
      return isAdmin || false
    } catch (e) {
      return { error: e }
    }
  }

  static async makeAdmin(userName) {
    try {
      const updateResponse = users.updateOne(
        { userName },
        { $set: { isAdmin: true } },
      )
      return updateResponse
    } catch (e) {
      return { error: e }
    }
  }
}

/**
 * Parameter passed to addUser method
 * @typedef UserInfo
 * @property {string} userName
 * @property {string} password
 */

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */
