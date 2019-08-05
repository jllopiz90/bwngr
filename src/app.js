import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan"; //requests logger middleware
import chooseAndInjectDB from './utils/dbMiddleware'; //my custom middleware
import managers from './components/managers/managers.route';
import marketSchema from './components/market/graphqlSchema';

const app = express();
app.use(cors());
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1/:league",chooseAndInjectDB);

app.use("/api/v1/:league/managers", managers);
app.use("/api/v1/:league/marketState", marketSchema);
app.get('/', (req, res) => res.send('Hello cheater, welcome to bwngrTrack!'));
// app.use("/", express.static("build"))   //  i don't have static resources yet
app.use("*", (req, res) => res.json({ error: "not found" }));

export default app;