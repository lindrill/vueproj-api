const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let result;
    const authHeader = req.headers.authorization
    
    if(authHeader){
        const token = req.headers.authorization.split(' ')[1]
        const option = {
            expiresIn: '2d',
        }

        try {
            result = jwt.verify(token, process.env.TOKEN_SECRET, option);
            req.decode = result;
            next()
        } catch( err) {
            res.status(401).send(err)
        }

    } else {
        result = {
            error: `Authentication error. Token required`,
            status: 401
        }
        res.status(401).send(result)
    }
}