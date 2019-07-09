import app from "./server";
import { MongoClient } from "mongodb";
import UsersDAO from "./dao/usersDAO";

const port = process.env.PORT || 8000

MongoClient.connect(
    process.env.BWNGR_DB_URI,
    { useNewUrlParser: true })
    .catch(err => {
        console.error('=====Error:', err.toString());
        console.error('=====Error stack:', err.stack);
        process.exit(1)
    })
    .then(async client => {
        await UsersDAO.injectDB(client);
        app.listen(port, () => {
            console.log(`listening on port ${port}`);
        })
    });