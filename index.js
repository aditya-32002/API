const express = require('express')

const url = require('url')

const apicache = require("apicache")

const cors = require('cors')

const ratelimit = require('express-rate-limit').default

const needle = require('needle')

require('dotenv').config()

const app = express()

app.use(cors())

let cache = apicache.middleware;
let limiter = ratelimit({
    windowMs: 10 * 60 * 1000, // milisecond
    max: 5
})
app.use(limiter)

console.log(process.env.API_BASE_URL)

const PORT = process.env.PORT || 5001

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

const API_BASE_KEY = process.env.API_BASE_KEY;
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const API_BASE_URL = process.env.API_BASE_URL;

app.get('/getweather', cache('2 minute'), async (req, res) => {
    try {
        const params = new URLSearchParams({
            [API_BASE_KEY]: API_KEY_VALUE,
            ...url.parse(req.url, true).query,
        });

        //make the get req using needle 

        const apiRes = await needle("get", `${API_BASE_URL}?${params}`);

        console.log(apiRes.body)

        res.status(200).json({
            data: apiRes.body
        })

        console.log(params)
    } catch (error) {
        console.log(error)
    }
})
app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT} `)
})