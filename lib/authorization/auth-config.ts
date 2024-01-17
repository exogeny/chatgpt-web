import type { IronSessionOptions } from 'iron-session';
import type { IronSessionOptions as IronSessionOptionsEdge } from 'iron-session/edge';

export const ironSessionTTL = 60 * 60 * 24 * 7;

export const sessionOptions: IronSessionOptions | IronSessionOptionsEdge = {
  // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
  password: process.env.SECRET_COOKIE_PASSWORD ?? "xs+::6<4^,-X.2RJ//~Xg`wy2fP3Ad\\13",
  cookieName: process.env.SECRET_COOKIE_NAME ?? "O9gQrr16p0",
  ttl: ironSessionTTL,
  // https://github.com/vvo/iron-session#ironoptions
  cookieOptions: {
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    secure: process.env.NODE_ENV === "production",
    // https://github.com/vvo/iron-session#session-cookies
    // maxAge: undefined // session expires when closing window/tab.
  },
}
