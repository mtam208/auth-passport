const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

const UserModel = require('./userDB')

const session = require('express-session')

// const redis = require('redis');
// const redisClient = redis.createClient();
// const redisStore = require('connect-redis')(session);
// redisClient.on('error', (err) => {
//   console.log('Redis error: ', err);
// });

app.use(session({
  secret: 'secret',
  name: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false},
  // store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 30*60*1000 })
}))

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    UserModel.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false);
      }
      if (user.password != password) {
        return done(null, false);
      }
      return done(null, user);  
    });
  }
));

app.use(passport.initialize());
app.use(passport.session())

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  UserModel.findById({ _id: id}, function(err, user) {
    done(err, user);
  });
});

app.listen(3000, (req, res)=>{
    console.log('Server started');
})

app.get('/login', (req, res)=>{
    res.sendFile(path.join(__dirname, 'login.html'))
})

app.get('/register', (req, res)=>{
    res.sendFile(path.join(__dirname, 'register.html'))
})

app.post('/register', (req, res)=>{
    UserModel.create({
        username: req.body.username,
        password: req.body.password
    })
    .then(data=>{
        res.redirect('/login')
    })
    .catch(err=>{
        console.log(err);
    })
})

app.post('/login', (req, res, next)=>{
  passport.authenticate('local', function(err, user) {
    if(err) return res.json('Server error')
    if(!user) return res.json('Username or password incorrect')
    return res.redirect('/home')
  })(req, res, next)
})

app.get('/private', function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.session.views) {
      req.session.views++
      res.setHeader('Content-Type', 'text/html')
      res.write('<p>views: ' + req.session.views + '</p>')
      res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
      res.end()
    } else {
      req.session.views = 1
      res.end('welcome to the session demo. refresh!')
    }
  }
  else {
    res.redirect('/login')
  }
  
})

app.get('/logout', (req, res, next)=>{
  req.session.destroy()
  res.json('Logout ok')
})

app.get('/home', (req, res, next)=>{
  res.json('Welcome')
})

