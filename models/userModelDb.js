const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  image: String
  /*img:{
    data: Buffer,
    contentType: String
  }*/
}, {timestamps: true});

//Here we'll do the encryption
UserSchema.pre('save', async function (next) {
  try{
    //here we generate salt and hash, then we modify the value
    //of this.password and we save it in the db
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next(); 
  }catch(error){
    next(error);
  }
})

//this function compares an encrypted password stored in the database 
//with a plainpassword inserted by the user during the login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

const userFromDb = mongoose.model('credentials', UserSchema);
module.exports = userFromDb;

