//loading all required libraries. 
    require('dotenv').config()
    //load express, mysql and mongo
    const express = require('express')
    const morgan = require('morgan')
    const { MongoClient, ObjectID, ObjectId  } = require('mongodb')
    const mysql = require('mysql2/promise')
    const cors = require('cors')
    const fetch = require('node-fetch')
    const { json } = require('body-parser')
    const nodemailer = require('nodemailer');
    const bodyParser = require('body-parser')
    // const passport = require('passport')
    const cookieSession = require('cookie-session')
    // require('./passport-setup')
    const passport = require("passport");
    const GoogleStrategy = require("passport-google-oauth20").Strategy;
    // const User = 1234;
    const jwt = require('jsonwebtoken')
    //const cookieSession = require("cookie-session");

    passport.use(
      new GoogleStrategy({
          clientID: process.env.googleClientID,
          clientSecret: process.env.googleClientSecret,
          callbackURL: '/auth/google/callback'
      }, (accessToken, refreshToken, profile, done) => {
          // passport callback function
          //check if user already exists in our db with the given profile ID
          
          findUser([profile.id])
          .then((currentUser)=>{
            console.log('currentUser',currentUser)
            // if(currentUser){
              if(currentUser.length > 0){
                //if we already have a record with the given profile ID
                done(null, currentUser);
              } else{
                //if not, create a new user 
                console.log('reacherd herr')
          insertUser([profile.id,profile._json.email,profile.displayName])
          .then((newUser) =>{
                    done(null, newUser);
                });
        }})
      }));
  

      passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });

//configure the port, pool and the databases configurations
    const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000
    const pool = mysql.createPool ({
      host : process.env.MYSQL_SERVER,
      port: process.env.SVR_PORT,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_SCHEMA,
      connectionLimit:process.env.MYSQL_CON_LIMIT
    })
    const MONGO_URL = 'mongodb://localhost:27017'
    const MONGO_DATABASE = 'stocklist'
    const MONGO_COLLECTION = 'table'
    const mongoClient = new MongoClient(MONGO_URL, 
      { useNewUrlParser: true, useUnifiedTopology: true })
    const TOKEN_SECRET = process.env.TOKEN_SECRET


// Create an instance of express (all of my app use)
    const app = express()
    app.use(morgan('combined'))
    app.use(cors())
    app.use(express.json())
    app.use(bodyParser.json())
    // app.use(cookieSession({
    //   name: 'stocks-session',
    //   keys: ['key1', 'key2']
    // }))

// const isLoggedIn = (req,res,next) => {
//   if (req.user){
//   next();
//   } else {
//   res.sendStatus(401);
//   }
// }

app.use(cookieSession({
  // milliseconds of a day
  maxAge: 24*60*60*1000,
  keys:[process.env.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());



//Google - Authentication
  // app.get('/watchlist',(req,res)=>{res.send("You have failed to login")})
  // app.get('/watchlist',isLoggedIn,(req,res)=>{res.send(`Welcome ${req.user.email}`)})
  // app.get('/failed',(req,res)=>{res.send("You have failed to login")})

  app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  // app.get("/auth/google/callback",passport.authenticate('google'));

  app.get('/auth/google/callback',
    passport.authenticate('google'), (req, res)=> {
      
      // generate JWT token
      const timestamp = (new Date()).getTime() / 1000
      const token = jwt.sign({
          sub: req.user.googleId,
          iss: 'stocks',
          iat: timestamp,
          nbf: timestamp + 30,
          exp: timestamp + (60 * 60),
          data:{
            userid: req.user.googleId
          }
      }, TOKEN_SECRET)

    let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
    responseHTML = responseHTML.replace('%value%', JSON.stringify({
        user: req.user,
        token
    }));
    res.status(200).send(responseHTML);
});

  // // app.get( '/google/callback',
  // //     passport.authenticate( 'google'),(req,res)=> {
  //     });

  // router.get("auth/google/callback",passport.authenticate("google"),(req,res)=>{
  //   res.send(req.user);
  //   res.send("you reached the redirect URI");
  // });

  app.get("/auth/logout", (req, res) => {
    req.logout();
    res.send(req.user);
    res.redirect('/')
  });



//Email Configuration
    let transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'bd71d8ca06a57e',
        pass: 'afa182d9e8ed42'
      }
    });
    app.post('/contact',async (req,res)=>{
      const payload = await req.body['message']
      console.log('payloadmessage>>>',payload)
      const message = {
        from: payload.email, // Sender address
        to: 'to@email.com',         // List of recipients
        subject: payload.subject, // Subject line
        text: `From : ${payload.name}:
        message: ${payload.message}`
        //payload.message // Plain text body
    };
    transport.sendMail(message, function(err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
           res.status(200);
          res.json(result);
        }
    });

    })

//table menu 
    app.get('/table',async (req,res)=>{
      const result = await mongoClient.db(MONGO_DATABASE)
       .collection(MONGO_COLLECTION)
       //.find({spac:'FIII'})
      .find({})
       .toArray()
        result.reverse()
        res.status(200);
        res.json(result);
    })

    app.get('/deletefromTable',async (req,res)=>{
          const spacID = req.query['ticker']
          const id = req.query['id']
          console.log("spacID",spacID)
          console.log("id",id)
          const sqlresult = await deletefromMainTableList([spacID])
          const mongoresult = await mongodata(id)
          await Promise.all([sqlresult,mongoresult])
          res.status(200)
          res.json({})
    })

    app.post('/table',async (req,res)=>{
        const spac = req.body.spac
        console.log('spac',spac)
        const result = await mongoClient.db(MONGO_DATABASE)
         .collection(MONGO_COLLECTION)
        .insertOne({ticker:spac.ticker,name:spac.name})
          res.status(200);
          res.json({});
    })

    app.get('/allstocks',async (req,res)=>{
      fetch("https://twelve-data1.p.rapidapi.com/stocks?exchange=NASDAQ&format=json", {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": "a7359cb6fcmsh9b44c6923778c4cp14b72ajsn66354aaf1f49",
        "x-rapidapi-host": "twelve-data1.p.rapidapi.com"
      }
      })
      .then(results => results.json())
      .then(results => {
        console.log(results);
        res.status(200).json(results['data']);
      })
      .catch(err => {
        console.error(err);
      });     
    })

//Homepage
    app.post('/spacstocks',async (req,res)=>{
      const payload = await req.body['spacsList']
      console.log(payload)
      fetch(`https://twelve-data1.p.rapidapi.com/quote?symbol=${payload}&interval=1day&format=json&outputsize=300`, {
        "method": "GET",
        "headers": {
          //"x-rapidapi-key": "bca9a7ec02mshfd2ac7f7572c44ep15378ajsn5e3feca2e30e",
          "x-rapidapi-key": "a7359cb6fcmsh9b44c6923778c4cp14b72ajsn66354aaf1f49",
          "x-rapidapi-host": "twelve-data1.p.rapidapi.com"
        }
      })
      .then(results => results.json())
      .then(results => {
        console.log(results);
        res.status(200).json(results);
      })
      .catch(err => {
        console.error(err);
      });     
    })

//News Page
    app.get('/news',async (req,res)=>{
        const category = 'business';
        const country = 'us';
        const pageSize = 18;
          fetch(`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}`,{
        "method": "GET",
        "headers": {
          "X-Api-Key": process.env.APIKEY,
        }
      })
      .then(results => results.json())
      .then(results => {
        console.log(results);
        res.status(200).json(results);
      })
      .catch(err => {
        console.error(err);
      });  
    });

//Individual Spacs Detail page - get stock details
    app.get('/stocks/:symbol',async (req,res)=>{
    const  symbol = req.params.symbol;
    fetch(`https://twelve-data1.p.rapidapi.com/quote?symbol=${symbol}&interval=1day&format=json&outputsize=300`, {
          "method": "GET",
          "headers": {
          // "x-rapidapi-key": "bca9a7ec02mshfd2ac7f7572c44ep15378ajsn5e3feca2e30e",
            "x-rapidapi-key": "a7359cb6fcmsh9b44c6923778c4cp14b72ajsn66354aaf1f49",
            "x-rapidapi-host": "twelve-data1.p.rapidapi.com"
          }
        })
        .then(results => results.json())
        .then(results => {
          console.log(results);
          res.status(200).json(results);
        })
        .catch(err => {
          console.error(err);
        });
    })     
              
//WATCHLIST
    app.post('/watchlist',async (req,res)=>{
        const payload = await req.body['data']
        console.log(payload)
        addWatchlist([payload.userid,payload.ticker,payload.loggeddate,payload.price])
          .then((results) => {
          res.status(200);
          res.json({});
          })
          .catch((err) => {
              console.error(err);
              res.status(500).json(err);
          })

      

        // fetch(`https://twelve-data1.p.rapidapi.com/quote?symbol=${payload}&interval=1day&format=json&outputsize=300`, {
        //   "method": "GET",
        //   "headers": {
        //     "x-rapidapi-key": "bca9a7ec02mshfd2ac7f7572c44ep15378ajsn5e3feca2e30e",
        //     //"x-rapidapi-key": "a7359cb6fcmsh9b44c6923778c4cp14b72ajsn66354aaf1f49",
        //     "x-rapidapi-host": "twelve-data1.p.rapidapi.com"
        //   }
        // })
        // .then(results => results.json())
        // .then(results => {
        //   console.log(results);
        //   res.status(200).json(results);
        // })
        // .catch(err => {
        //   console.error(err);
        // });     
    })
      
    app.post('/deletewatchlist',async (req,res)=>{
        const payload = await req.body['data']
        console.log(payload)
        delWatchlist([payload.userid,payload.id,payload.ticker])
            .then((results) => {
          res.status(200);
          res.json({});
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json(err);
            })
    })

    app.get('/getwatchlist',async (req,res)=>{
        const payload = await req.query['userid']
        console.log(payload)
        // const p1 = await req.params['userid']
        // console.log(p1)
        getWatchlist1([payload])
            .then((results) => {
          console.log(results)
            res.status(200).json(results);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json(err);
            })
    })

    app.get('/totalwatchlist',async (req,res)=>{
        const payload = await req.query['userid']
        console.log(payload)
        totalWatchList([payload])
            .then((results) => {
          console.log(results)
            res.status(200).json(results[0]);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json(err);
            })
    })


//constructing the url queries. One is of Get. Another one is of Insert. 
    //const SQL_querytest="select * from users"
    const SQL_deletefromMainTable = "delete from watchlist where ticker=?"
    const SQL_getwatchlist = "select idwatchlist, google_id, ticker, loggeddate,open_price from watchlist where google_id=?"
    const SQL_watchlistInsert = "insert into watchlist(google_id,ticker, loggeddate,open_price) values (?,?,?,?) "
    const SQL_deleteWatchList = "delete from watchlist where google_id=? and idwatchlist=? and ticker=?"
    const SQL_totalWatchList = "select count(*) as count from watchlist where google_id=?"
    const SQL_findUser = "select google_id from users where google_id=?"
    const SQL_insertUser = "insert into users(google_id, emailid, name) values (?,?,?)"


//closure function - using the same function to make query.
    const makeQuery=(sql,pool)=> {
      console.log(sql)
      return (async (args)=>{
        const conn = await pool.getConnection();
        try {
          let results = await conn.query(sql,args||[]);
          console.log(results);
          return results[0];
        }catch (err){
          console.log(err)
        }
        finally{
          conn.release()
        }
      })
    }

//assigning the closure function to a variable.
    //const test = makeQuery(SQL_querytest, pool);
    const addWatchlist = makeQuery(SQL_watchlistInsert,pool);
    const delWatchlist  = makeQuery(SQL_deleteWatchList,pool);
    const getWatchlist1  = makeQuery(SQL_getwatchlist,pool);
    const deletefromMainTableList  = makeQuery(SQL_deletefromMainTable,pool);
    const totalWatchList = makeQuery(SQL_totalWatchList,pool)
    const findUser = makeQuery(SQL_findUser,pool);
    const insertUser = makeQuery(SQL_insertUser,pool);


//start the server,
    const promise1 = mongoClient.connect();
    const promise2 = pool.getConnection()
        .then( (conn) => {
            try {
                conn.ping();
            } finally {
                conn.release()
            }
        });
    Promise.all([promise1, promise2])
        .then(() => {
            app.listen(PORT, () => {
                console.info(`Application started on PORT: ${PORT} at ${new Date()}`);
            })
        })
        .catch(e => {
            console.error(`Cannot connect to database: `,e)
        });
    const mongodata = async (spacID)=>{
       await mongoClient.db(MONGO_DATABASE).collection(MONGO_COLLECTION)
          .deleteOne({"_id":ObjectId(spacID)})
           return
  }
