class ErrorHandler extends Error{
    constructor(message,statusCode, data = null){
        super(message);
        this.statusCode = statusCode,
        this.data = data

        Error.captureStackTrace(this,this.constructor);      
    }  
}

module.exports = ErrorHandler