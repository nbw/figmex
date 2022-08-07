/**
 * A basic data store
 *
 * Note: nothing revolutionary here, but abstracted away so that
 * it could be replaced by something better in the future.
 */

export default class Store {
  state: object;
  constructor(defaultState = {}) {
    this.state = defaultState;
  }

  get(id: string): any {
    return this.state[id];
  }

  count(): number {
    return Object.keys(this.state).length;
  }

  exists(id: string): boolean {
    return id in this.state && this.get(id);
  }

  update(id: string, obj: any) {
    this.state[id] = obj;
  }

  delete(id: string) {
    delete this.state[id];
  }

  values(): any[] {
    return Object.values(this.state);
  }

  reset() {
    this.state = {};
  }
}
