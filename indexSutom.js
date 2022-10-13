const express = require('express')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const request = require('request')
const app = express()
const atob= require('atob')
// when running 'PORT=5000 node index
const port = process.env.PORT || 3000 
const fs = require('fs')
const os =require('os')



app.use(session({
  secret: 'nathan-leo',
  name: 'sessionId',
  saveUninitialized:true,
  resave:false,
  cookie: { 
    secure: false,
    httpOnly: true
  }
}))

// REDIRECT_URI from authorize (loginAPI)
app.get('/callback', (req,res)=>{
  let name = ""
  //Make the api call to the auth server to get the token
  request(`http://localhost:5000/token?code=${req.query.code}`, function (error, response, body) {
    let tab= body.split(".");
    name = atob(tab[1])
    req.session.name=name;
  })
  // timeout alows to wait for the asynch api call to finish
  setTimeout(function(){
  // redirecting to /index
  res.redirect('/')
  },300);
})
// auto redirecting if not authentified
app.use((req,res,next)=>{
  if(req.session.name){
    // continue executing other script in this file ** 
    next()
  }else{
    console.log('session does not exist -> redirecting to login')
    res.redirect('http://localhost:5000/authorize?client_id=Sutom-nathan-leo&scope=openid,profile&redirect_uri=http://localhost:3000/callback&nounce=XXXX')
  }
})
// ** like this
// use public files
app.use(express.static(__dirname+'/public'));

// send public index file
app.get('/', (req, res) => {
  res.sendFile(__dirname+'/public/index.html')
})

// send the data from data.json to the client
app.get('/data', (req,res)=>{
  let data
  request(`http://localhost:5001/data?name=${req.session.name}`, function (error, response, body) {
    data = JSON.parse(body)
  })
  // timeout alows to wait for the asynch api call to finish
  setTimeout(function(){
    // redirecting to /index
    res.json(data)
  },300);
})



// send word of the day to app
app.get('/text', (req, res) => {
  path = "./data/liste_francais_utf8.txt"
  const words = fs.readFileSync(path,'utf8')
  const tabOfWords = words.split(/\r?\n/);

  // get seed of the day
  const date = new Date()
  const seed = date.getDay()

  // choose word of the day
  const index = seed % tabOfWords.length * 599
  const todaysWord = tabOfWords[index]

  res.json({todaysWord})
})

app.get("/session", (req,res)=>{
  res.json(req.session.name)
})

// API to show current port
app.get('/port', (req,res)=>{
  const ourOs = os.hostname()
  res.send(`MOTUS APP LISTENING ON ${ourOs} on ${port}`)
})


app.get('/success', (req,res)=>{
  request(`http://localhost:5001/success?name=${req.session.name}&data=${JSON.stringify(req.query)}`, function (error, response, body) {
    console.log("err= ", error)
  })
})

// score
app.get('/score', (req,res)=>{
  res.redirect(`http://localhost:5001?name=${req.session.name}`) 
})

// show simple message to server terminal
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})