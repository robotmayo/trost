
module.exports = function query(connection, queryString, ...args){
  return new Promise((resolve, reject) => {
    connection.query(queryString, args, (err, results) => {
      if(err) return reject(err);
      resolve(results);
    });
  });
};
