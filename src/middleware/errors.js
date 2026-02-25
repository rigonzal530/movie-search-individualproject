function errorHandler(err, req, res, next) {
    // defaults for any errors without custom handling
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';

    // return full stack trace and other helpful data in development
    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            code: code,
            message: err.message,
            timestamp: new Date().toISOString(),
            stack: err.stack,
            path: req.originalUrl,
            method: req.method
        });
    }
    // return bare minimum for any other environments (like production)
    else {
        res.status(statusCode).json({
            code: code,
            message: statusCode === 500 ? 'Internal Server Error': err.message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = errorHandler;