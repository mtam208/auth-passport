const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/passport-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const Schema = mongoose.Schema;
 
const userSchema = new Schema({
  username: {
      type: String,
      required: true,
      unique: true
  },
  password: {
      type: String,
      required: true
  }
});

const UserModel = mongoose.model('user', userSchema)

module.exports = UserModel