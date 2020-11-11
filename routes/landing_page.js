const router = require("express").Router();
const auth = require('../verifyToken');
// const { route } = require("./auth");

router.get('/', auth, (request,response) => {
    response.send({title: 'data for logged users'});
});

module.exports = router;