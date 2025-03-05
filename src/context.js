export class Context {
  /**
   * @param {unknown} context
   * @param {unknown} [value]
   */
  constructor(context, value) {
    this.context = context;
    this.value = value;
  }
}
