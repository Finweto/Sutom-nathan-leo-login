const express = require('express')
const session = require('express-session')

const app = express()
// when running 'PORT=5000 node index
const port = process.env.PORT || 3000 
const fs = require('fs')
const os =require('os')
const cors = require('cors')

// add express-session
//app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 's3Cur3',
  name: 'sessionId',
  saveUninitialized:true,
  resave:true,
  cookie: { 
    secure: false,
    httpOnly: true
  }
}))


app.get('/callback',(res,req)=>{
  console.log(req.session)
  req.session['user'] = "couocu"
  res.redirect('/')
})

// auto redirecting if not authentified
app.use((req,res,next)=>{ 
  if(req.session && req.session.user){
    
      console.log(req.session.user)
      next()
  }else{
    console.log('session does not exist -> redirecting to login')
    res.redirect('http://localhost:5000/authorize?client_id=Sutom-nathan-leo&scope=openid,profile&redirect_uri=http://localhost:3000/callback&nounce=XXXX')
  }
})

// use public files
app.use(express.static(__dirname+'/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/index.html')
})

// send tab of wordsList to app
app.get('/text', (req, res) => {
  path = "./data/liste_francais_utf8.txt"
  const words = fs.readFileSync(path,'utf8')
  const tabOfWords = words.split(/\r?\n/);
  res.json({tabOfWords})
})



app.get('/port', (req,res)=>{
  const ourOs = os.hostname()
  res.send(`MOTUS APP LISTENING ON ${ourOs} on ${port}`)
})

// score
app.get('/score', (req,res)=>{
  res.send('/score.html')
})

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})

