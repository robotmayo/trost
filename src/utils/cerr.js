// Note captureStackTrace doesnt work outside of V8
// This code isnt expected to run outside of node, at least not right now
/**
 * 
 * 
 * @class ValidationError
 * @extends {Error}
 */
class ValidationError extends Error{
  /**
   * Creates an instance of ValidationError.
   * 
   * @param {string} message
   * 
   * @memberOf ValidationError
   */
  constructor(message){
    super(message);
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports.ValidationError = ValidationError;
