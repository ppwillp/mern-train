const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');


//routes
const users = require('./routes/api/users');
const profiles = require('./routes/api/profiles');
const posts = require('./routes/api/posts');

//Body Parser MW
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
//const db = require('./config/keys').mongoURI;
const db = require('./config/db');
mongoose
  .connect(db.mongoURI)
  .then(() => {
    console.log("MongoDB connected...")
  })
  .catch(err => {
    console.log(err);
    if(err.errorLabels && err.errorLabels.indexOf('TransientTransactionError') >= 0) {
      console.log('TransientTransactionError, retrying...');
      mongoose.connect(db);
    } else {
      throw err;
    }
  });

// PASSPORT MW
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

//use routes
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});