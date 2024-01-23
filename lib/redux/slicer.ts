import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export enum AuthorizeTagTypes {
  AUTH = 'AUTH', // Authentication session
}

export enum ChatTagTypes {
  CHAT = 'CHAT', // Chat session
}

/**
 * HTTP query types.
 * Used by Redux Toolkit Query API
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
export enum HttpQueryType {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export const AuthorizeSlicer = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: Object.values(AuthorizeTagTypes),
  endpoints: () => ({}),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
});

export const ChatSlicer = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: Object.values(AuthorizeTagTypes),
  endpoints: () => ({}),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
});
