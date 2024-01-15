
/**
 * Iron session data format to be used.
 */
export interface IAuthorizationSession {
  /**
   * Password of authentication, stored as sha256sum.
   */
  password: string;
}

/**
 * This is where we specify the typings of request.session.*
 */
declare module "iron-session" {
  interface IronSessionData {
    authorizationSession: IAuthorizationSession;
  }
}