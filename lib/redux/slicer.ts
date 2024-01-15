import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export enum TagTypes {
  AUTH = 'AUTH', // Authentication session
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

const Slicer = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: Object.values(TagTypes),
  endpoints: () => ({}),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
});

export default Slicer;