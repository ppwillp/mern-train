if(process.env.NODE_ENV === 'production') {
  module.exports = {
    mongoURI: 'mongodb://wpittman:Element436@ds227664.mlab.com:27664/devconnector'
  }
} else {
  module.exports = {
    mongoURI: 'mongodb://localhost/vidjot-dev'
  }
}