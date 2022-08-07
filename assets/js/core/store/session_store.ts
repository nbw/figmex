import Store from "../store";

export default class SessionStore extends Store {
  /**
   * @returns current session id (user id)
   */
  id(): string {
    return this.get("id");
  }

  /**
   * Check if current user
   */
  isCurrentUser(userId: string): boolean {
    return this.get("id") == userId;
  }

  /**
   * Retrieve action
   */
  action(): string | null {
    return this.get("action");
  }
}
