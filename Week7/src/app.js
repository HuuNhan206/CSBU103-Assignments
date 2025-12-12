const express = require('express')
const path = require('path')
var cookieParser = require("cookie-parser")
var session = require("express-session")
const app = express()
const UserController = require('./controllers/user') 
const { UserModel } = require('./models')
var debug = require("debug")("index.js");

app.use(express.json())
app.use(express.urlencoded(({ extended: false })))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/users', UserController)
app.use(cookieParser())
app.use(
  session({
    secret: "demoapp",
    name: "app",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } /* 1 hour */
  })
);
const checkLoggedIn = function(request, response, next) {
  if (request.session.loggedIn) {
    // debug(
    //   "checkLoggedIn(), req.session.loggedIn:",
    //   req.session.loggedIn,
    //   "executing next()"
    // );
    next();
  } else {
    // debug(
    //   "checkLoggedIn(), req.session.loggedIn:",
    //   req.session.loggedIn,
    //   "rendering login"
    // );
    response.redirect("login");
  }
}


app.get('/', checkLoggedIn, async function (request, response) {
  // res.sendFile(path.join(__dirname,'index.html'))
  const allUsers = await UserModel.getAllUsers()
  
  console.log(allUsers)
  response.render('index', { data: allUsers || [] })
})

app.post('/login', async function(req, res) {
  const { username, password } = req.body     
    try {
        const user = await UserModel.findUserByUsername(username)
        // FAIL-FAST 
        console.log({ user });
        if (user && (user.username === username) && (user.password === password)) {
          req.session.loggedIn = true
          req.session.username = username  // Store username in session
          res.redirect('/')

        } else {
        throw new Error('Unauthorized access')
        // if(!user || user.username !== username || user.password !== password) throw new Error('Unauthorized access')
        // req.session.loggedIn = true
        }
    }
    catch(error) {
      console.error(error)
      res.render('login', { errorMessage: error.message })
    }
})

app.get('/login', function(req, res) {
  if(req.session.loggedIn) res.redirect('/')
  res.render('login')
})

app.get('/register', function(req, res) {
  if(req.session.loggedIn) res.redirect('/')
  res.render('register')
})

app.post('/register', async function(req, res) {
  const { username, password, confirmPassword } = req.body
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // Password validation regex: at least 6 characters, 1 number, 1 special character
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/
  
  try {
    // Validate username (email format)
    if (!username || username.trim() === '') {
      throw new Error('Username is required')
    }
    if (!emailRegex.test(username)) {
      throw new Error('Username must be a valid email address')
    }
    
    // Validate password
    if (!password || password === '') {
      throw new Error('Password is required')
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least 1 number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least 1 special character')
    }
    
    // Validate confirm password
    if (!confirmPassword || confirmPassword === '') {
      throw new Error('Please confirm your password')
    }
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match')
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findUserByUsername(username)
    if (existingUser) {
      throw new Error('Username already exists')
    }
    
    // Create new user
    const newUser = {
      username: username,
      password: password
    }
    
    await UserModel.insertUser(newUser)
    
    // Redirect to login page with success message
    res.render('register', { successMessage: 'Registration successful! Please login.' })
    
  } catch(error) {
    console.error(error)
    res.render('register', { errorMessage: error.message })
  }
})

// Logout route
app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err)
    }
    res.redirect('/login')
  })
})

// Change password routes
app.get('/change-password', checkLoggedIn, function(req, res) {
  res.render('change-password')
})

app.post('/change-password', checkLoggedIn, async function(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body
  
  try {
    // Get current user from session
    const username = req.session.username
    if (!username) {
      throw new Error('User not logged in')
    }
    
    const user = await UserModel.findUserByUsername(username)
    
    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect')
    }
    
    // Validate new password
    if (!newPassword || newPassword === '') {
      throw new Error('New password is required')
    }
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new Error('Password must contain at least 1 number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      throw new Error('Password must contain at least 1 special character')
    }
    
    // Validate confirm password
    if (!confirmPassword || confirmPassword === '') {
      throw new Error('Please confirm your new password')
    }
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match')
    }
    
    // Update password
    await UserModel.updatePassword(username, newPassword)
    
    res.render('change-password', { successMessage: 'Password changed successfully!' })
    
  } catch(error) {
    console.error(error)
    res.render('change-password', { errorMessage: error.message })
  }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})