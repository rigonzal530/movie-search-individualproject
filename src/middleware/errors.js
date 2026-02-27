function errorHandler(err, req, res, next) {
    // defaults for any errors without custom handling
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const isOperational = err.isOperational || false;
    let errorDetails;

    // return full stack trace and other helpful data in development
    if (process.env.NODE_ENV === 'development') {
        errorDetails = {
            code: code,
            message: err.message,
            timestamp: new Date().toISOString(),
            stack: err.stack,
            path: req.originalUrl,
            method: req.method
        };
    }
    // return bare minimum for any other environments (like production)
    else {
        errorDetails = {
            code: code,
            message: (statusCode === 500 || !isOperational) ? 'Internal Server Error': err.message,
            timestamp: new Date().toISOString()
        }
    }

    if (req.accepts('html')) {
        return res.status(statusCode).render('pages/error', errorDetails);
    }
    return res.status(statusCode).json(errorDetails);
};

module.exports = errorHandler;