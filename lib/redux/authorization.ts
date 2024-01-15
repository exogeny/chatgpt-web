import Slicer, { TagTypes, HttpQueryType } from "./slicer";
import { IAuthorizationSession } from "@/lib/model/authentication";
import {
  getAuthenticationSessionUrl,
  postAuthenticationSessionUrl,
  deleteAuthenticationSessionUrl,
} from "@/lib/configs/urls";

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
        url: getAuthenticationSessionUrl,
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
        url: postAuthenticationSessionUrl,
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
        url: deleteAuthenticationSessionUrl,
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