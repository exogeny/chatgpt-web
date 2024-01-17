import Slicer, { TagTypes, HttpQueryType } from "./slicer";
import { IAuthorizationSession } from "@/lib/model/authentication";

export interface SessionState extends Omit<IAuthorizationSession, 'password'> {
  /**
   * Message returned by the API.
   */
  message: string;
}

const authenticationSession = Slicer.injectEndpoints({
  endpoints: (build) => ({
    getAuthenticationSession: build.query<IAuthorizationSession, void>({
      query: () => ({
        url: "auth",
        method: HttpQueryType.GET,
      }),
      transformResponse: (response: IAuthorizationSession) => {
        return {
          ...response,
          password: '********',
        };
      },
      providesTags: () => [{ type: TagTypes.AUTH }],
    }),
    postAuthenticationSession: build.mutation<Pick<SessionState, "message">, IAuthorizationSession>({
      query: ({ password }) => ({
        url: "auth",
        method: HttpQueryType.POST,
        body: { password },
      }),
      invalidatesTags: [{ type: TagTypes.AUTH }],
      transformResponse: (response: { message: string }) => {
        return { message: response.message };
      },
    }),
    deleteAuthenticationSession: build.mutation<Pick<SessionState, "message">, void>({
      query: () => ({
        url: "auth",
        method: HttpQueryType.DELETE,
      }),
      invalidatesTags: [TagTypes.AUTH],
    }),
  }),
});

export const {
  useGetAuthenticationSessionQuery,
  usePostAuthenticationSessionMutation,
  useDeleteAuthenticationSessionMutation,
} = authenticationSession;