/**
 * 
 */
class ErrorValidation extends Error {
    constructor(message, cause) {
        super(message);
        cause && (this.cause = cause);
        this.name = this.constructor.name;
    }
}

module.exports = {
    ErrorValidation
}