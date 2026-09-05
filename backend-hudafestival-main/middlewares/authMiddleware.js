const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token's ID and attach to the REQUEST object
            // THE FIX IS HERE: It should be req.user, not res.user
            req.user = await User.findById(decoded.id).select('-password');
            
            next(); // Move to the next middleware/controller
        }
        catch (error) {
            console.error(`Authorization Error: ${error.message}`);
            // This is a client error (bad token), not a server error.
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if(!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this role' });
        }
        next();
    };
};

module.exports = { protect, authorize };
