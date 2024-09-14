const express = require('express')
const cors = require('cors')
const url = require('url')
const needle = require('needle')
const rateLimit = require('express-rate-limit')

require('dotenv').config()

const app = express()

//rtae limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, //1 min
    max: 5
    
})
app.use(limiter)
app.set('trust proxy', 1)

//set statis
app.use(express.static('public'))


//route
app.use('/api' , require('./route') )

app.use(cors())

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`)
})

