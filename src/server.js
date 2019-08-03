/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import app from "./app";
import { MongoClient } from "mongodb";
import UsersDAO from "./components/users/usersDAO";
import ManagersDAO from "./components/managers/managersDAO";
import PlayersDAO from "./components/players/playersDAO";
import TransfersDAO from "./components/market/transfersDAO";
import TeamsDAO from "./components/teams/teamsDAO";
const port = process.env.PORT || 8000;


MongoClient.connect(
    process.env.BWNGR_DB_URI,
    { poolSize: 50, wtimeout: 2500, useNewUrlParser: true },
).catch(err => {
    console.error(err.stack)
    process.exit(1)
}).then(async client => {
    const db = client.db(process.env.BWNGR_DB_PL);
    await UsersDAO.injectDB(db);
    await PlayersDAO.injectDB(db);
    await ManagersDAO.injectDB(db);
    await TransfersDAO.injectDB(db);
    await TeamsDAO.injectDB(db);
    res.end(JSON.stringify(result));
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})