const jwt = require('jsonwebtoken');

module.exports = function auth(request, response, next) {
    const token = request.header('auth-token');
    if (!token) {
        response.status(401).send('Access denied');
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_TOKEN);
        require.user = verified;
        next();
    } catch(err) {
        response.status(400).send('Invalid Token');
    }
}

