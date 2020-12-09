const fs = require('fs');
const errorlog = require('errorlog')({
    logger: fs.createWriteStream("./error.log", { flags: "a" }),
    level: 100
  });


module.exports = (err, id) => {
    console.error("HERE");
    const log = errorlog(id + '; ' + err);
    
}

