const getUserByEmail = function(email, database) {
  //convert users to array using obj.values, returns a user object
  let arrayValues = Object.values(database);
  return arrayValues.find(user => email === user.email);
};

module.exports =  getUserByEmail;