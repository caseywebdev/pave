export default class PaveError extends Error {
  constructor(code, info) {
    super();
    this.code = code;
    Object.assign(this, info);
  }
}
