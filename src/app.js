import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan"; //requests logger middleware
import chooseAndInjectDB from './utils/dbMiddleware'; //my custom middleware
import managers from './components/managers/managers.route';

const app = express();
app.use(cors());
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(chooseAndInjectDB);

app.use("/api/v1/managers", managers);
app.get('/', (req, res) => res.send('Hello cheater, welcome to bwngrTrack!'));
// app.use("/", express.static("build"))   //  i don't have static resources yet
app.use("*", (req, res) => res.json({ error: "not found" }));

export default app;