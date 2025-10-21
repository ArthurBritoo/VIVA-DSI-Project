import * as _tanstack_react_query from '@tanstack/react-query';
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { User, AuthError, Auth, ActionCodeInfo, UserCredential, PopupRedirectResolver, ActionCodeSettings, AuthCredential } from 'firebase/auth';

type AuthUseQueryOptions$1<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError>, "queryFn" | "queryKey"> & {
    auth?: {
        forceRefresh?: boolean;
    };
};
/**
 * Hook to get an ID token for a Firebase user
 * @param user - The Firebase User object (or null)
 * @param options - Query options including auth configuration
 * @returns TanStack Query result with the ID token
 *
 * @remarks
 * If you override the `enabled` option and set it to `true` while `user` is null, the query will run and immediately error.
 * This is allowed for advanced use cases, but is not recommended for most scenarios.
 *
 * @example
 * // Basic usage - gets cached token
 * const { data: token, isLoading } = useGetIdTokenQuery(user);
 *
 * // Force refresh the token
 * const { data: token } = useGetIdTokenQuery(user, {
 *   auth: { forceRefresh: true }
 * });
 *
 * // With additional query options
 * const { data: token, refetch } = useGetIdTokenQuery(user, {
 *   enabled: !!user,
 * });
 *
 * // Handle side effects with useEffect
 * useEffect(() => {
 *   if (token) {
 *     // Use token for API calls
 *     api.setAuthToken(token);
 *   }
 * }, [token]);
 *
 * // Manually re-fetch token (respects the initial forceRefresh option)
 * const { refetch } = useGetIdTokenQuery(user);
 * const handleRefetch = () => refetch();
 *
 * // For actual force refresh, use a separate query with forceRefresh: true
 * const { data: freshToken, refetch: refetchFresh } = useGetIdTokenQuery(user, {
 *   auth: { forceRefresh: true },
 *   enabled: false, // Manual trigger only
 * });
 * const handleForceRefresh = () => refetchFresh();
 */
declare function useGetIdTokenQuery(user: User | null, options?: AuthUseQueryOptions$1<string, AuthError | Error>): _tanstack_react_query.UseQueryResult<string, Error | AuthError>;

type AuthUseMutationOptions$9<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useApplyActionCodeMutation(auth: Auth, options?: AuthUseMutationOptions$9<void, AuthError, string>): _tanstack_react_query.UseMutationResult<void, AuthError, string, unknown>;

type AuthUseMutationOptions$8<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useCheckActionCodeMutation(auth: Auth, options?: AuthUseMutationOptions$8<ActionCodeInfo, AuthError, string>): _tanstack_react_query.UseMutationResult<ActionCodeInfo, AuthError, string, unknown>;

type AuthUseMutationOptions$7<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useConfirmPasswordResetMutation(auth: Auth, options?: AuthUseMutationOptions$7<void, AuthError, {
    oobCode: string;
    newPassword: string;
}>): _tanstack_react_query.UseMutationResult<void, AuthError, {
    oobCode: string;
    newPassword: string;
}, unknown>;

type AuthUseMutationOptions$6<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useCreateUserWithEmailAndPasswordMutation(auth: Auth, options?: AuthUseMutationOptions$6<UserCredential, AuthError, {
    email: string;
    password: string;
}>): _tanstack_react_query.UseMutationResult<UserCredential, AuthError, {
    email: string;
    password: string;
}, unknown>;

type AuthUMutationOptions<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useDeleteUserMutation(_auth: Auth, options?: AuthUMutationOptions<void, AuthError, User>): _tanstack_react_query.UseMutationResult<void, AuthError, User, unknown>;

type AuthUseQueryOptions<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError, void>, "queryFn"> & {
    auth?: {
        resolver?: PopupRedirectResolver;
    };
};
declare function useGetRedirectResultQuery(auth: Auth, options: AuthUseQueryOptions<UserCredential | null, AuthError>): _tanstack_react_query.UseQueryResult<void, AuthError>;

type AuthMutationOptions$1<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useReloadMutation(options?: AuthMutationOptions$1<void, AuthError, User>): _tanstack_react_query.UseMutationResult<void, AuthError, User, unknown>;

type AuthMutationOptions<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;

declare function useRevokeAccessTokenMutation(auth: Auth, options?: AuthMutationOptions<void, AuthError, string>): _tanstack_react_query.UseMutationResult<void, AuthError, string, unknown>;

type SendSignInLinkParams = {
    email: string;
    actionCodeSettings: ActionCodeSettings;
};
type AuthUseMutationOptions$5<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useSendSignInLinkToEmailMutation(auth: Auth, options?: AuthUseMutationOptions$5<void, AuthError, SendSignInLinkParams>): _tanstack_react_query.UseMutationResult<void, AuthError, SendSignInLinkParams, unknown>;

type SignInAnonymouslyOptions = Omit<UseMutationOptions<UserCredential, AuthError, void>, "mutationFn">;
declare function useSignInAnonymouslyMutation(auth: Auth, options?: SignInAnonymouslyOptions): _tanstack_react_query.UseMutationResult<UserCredential, AuthError, void, unknown>;

type AuthUseMutationOptions$4<TData = unknown, TError = Error> = Omit<UseMutationOptions<TData, TError, void>, "mutationFn">;
declare function useSignInWithCredentialMutation(auth: Auth, credential: AuthCredential, options?: AuthUseMutationOptions$4<UserCredential, AuthError>): _tanstack_react_query.UseMutationResult<UserCredential, AuthError, void, unknown>;

type AuthUseMutationOptions$3<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useSignInWithEmailAndPasswordMutation(auth: Auth, options?: AuthUseMutationOptions$3<UserCredential, AuthError, {
    email: string;
    password: string;
}>): _tanstack_react_query.UseMutationResult<UserCredential, AuthError, {
    email: string;
    password: string;
}, unknown>;

type AuthUseMutationOptions$2<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useSignOutMutation(auth: Auth, options?: AuthUseMutationOptions$2): _tanstack_react_query.UseMutationResult<void, Error, void, unknown>;

type AuthUseMutationOptions$1<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useUpdateCurrentUserMutation(auth: Auth, options?: AuthUseMutationOptions$1<void, AuthError, User | null>): _tanstack_react_query.UseMutationResult<void, AuthError, User | null, unknown>;

type AuthUseMutationOptions<TData = unknown, TError = Error, TVariables = void> = Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">;
declare function useVerifyPasswordResetCodeMutation(auth: Auth, options?: AuthUseMutationOptions<string, AuthError, string>): _tanstack_react_query.UseMutationResult<string, AuthError, string, unknown>;

export { useApplyActionCodeMutation, useCheckActionCodeMutation, useConfirmPasswordResetMutation, useCreateUserWithEmailAndPasswordMutation, useDeleteUserMutation, useGetIdTokenQuery, useGetRedirectResultQuery, useReloadMutation, useRevokeAccessTokenMutation, useSendSignInLinkToEmailMutation, useSignInAnonymouslyMutation, useSignInWithCredentialMutation, useSignInWithEmailAndPasswordMutation, useSignOutMutation, useUpdateCurrentUserMutation, useVerifyPasswordResetCodeMutation };
