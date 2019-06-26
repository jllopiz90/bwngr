import app from "./server";
import { MongoClient } from "mongodb";

const port = process.env.PORT || 8000
MongoClient.connect(process.env.BWNGR_DB_URI,  { useNewUrlParser: true }, async (err, client) => {
        if(err){
            console.log('=====Error:',err);
            throw err;
        }

        //await some dao and pass it the client as an innjection

        // db gives access to the database
        // const db = client.db(process.env.BWNGR_DB);
        //linten on port
        app.listen(port, () => {
            console.log(`listening on port ${port}`)
          })
})