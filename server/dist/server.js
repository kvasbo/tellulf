"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const port = process.env.HTTP_PORT;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'false');
    next();
});
app.use(express_1.default.static('../client/build'));
app.listen(port, () => {
    console.log(`Serving static files at ${port}`);
});
app.get('/proxy', async (req, res) => {
    console.log('Get', req.query.url);
    axios_1.default
        .get(req.query.url)
        .then((data) => {
        res.send(data.data);
        return;
    })
        .catch((err) => {
        console.log(err);
    });
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
