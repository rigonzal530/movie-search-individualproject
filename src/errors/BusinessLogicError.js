class BusinessLogicError extends Error {
    constructor(message, code = 'INTERNAL_ERROR', statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = BusinessLogicError;