const express = require('express');
const app = express();
const mongoose = require('mongoose');

//routes
const users = require('./routes/api/users');
const profiles = require('./routes/api/profiles');
const posts = require('./routes/api/posts');

const port = process.env.PORT || 5000;

// DB Config
const db = require('./config/keys').mongoURI;
mongoose
  .connect(db)
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

app.get('/', (req, res, next) => {
  res.send('hello');
});

//use routes
app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});