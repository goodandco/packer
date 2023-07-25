export class APIException extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, APIException.prototype);
  }
}
