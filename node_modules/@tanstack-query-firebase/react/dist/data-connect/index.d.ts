import { QueryClient, FetchQueryOptions, QueryKey, UseMutationResult, UseQueryResult, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';
import { QueryRef, QueryResult, MutationResult, MutationRef, DataConnect, CallerSdkType, ConnectorConfig } from 'firebase/data-connect';

type DataConnectQueryOptions<Data, Variables> = Omit<FetchQueryOptions<Data, FirebaseError, Data, QueryKey>, "queryFn" | "queryKey"> & {
    queryRef: QueryRef<Data, Variables>;
    queryKey?: QueryKey;
};
declare class DataConnectQueryClient extends QueryClient {
    prefetchDataConnectQuery<Data extends Record<string, any>, Variables>(refOrResult: QueryRef<Data, Variables> | QueryResult<Data, Variables>, options?: DataConnectQueryOptions<Data, Variables>): Promise<void>;
}

type QueryResultRequiredRef<Data, Variables> = Partial<QueryResult<Data, Variables>> & Required<Pick<QueryResult<Data, Variables>, "ref">>;
type UseDataConnectQueryResult<Data, Variables> = UseQueryResult<Data, FirebaseError> & {
    dataConnectResult?: QueryResultRequiredRef<Data, Variables>;
};
type UseDataConnectMutationResult<Data, Variables> = UseMutationResult<Data, FirebaseError, Variables> & {
    dataConnectResult?: Partial<MutationResult<Data, Variables>>;
};

type useDataConnectMutationOptions<TData = unknown, TError = FirebaseError, Variables = unknown> = Omit<UseMutationOptions<TData, TError, Variables>, "mutationFn"> & {
    invalidate?: ReadonlyArray<QueryRef<unknown, unknown> | (() => QueryRef<unknown, unknown>)>;
};
declare function useDataConnectMutation<Fn extends (() => MutationRef<any, any>) | ((vars: any) => MutationRef<any, any>), Data = ReturnType<Fn extends () => MutationRef<infer D, any> ? () => MutationRef<D, any> : Fn extends (vars: any) => MutationRef<infer D, any> ? (vars: any) => MutationRef<D, any> : Fn> extends MutationRef<infer D, any> ? D : never, Variables = Fn extends () => MutationRef<any, any> ? void : Fn extends (vars: infer V) => MutationRef<any, any> ? V : Fn extends (dc: DataConnect, vars: infer V) => MutationRef<any, any> ? V : never>(ref: Fn, options?: useDataConnectMutationOptions<Data, FirebaseError, Variables>, _callerSdkType?: CallerSdkType): UseDataConnectMutationResult<Data, Variables>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type useDataConnectQueryOptions<TData = object, TError = FirebaseError> = PartialBy<Omit<UseQueryOptions<TData, TError>, "queryFn">, "queryKey">;
declare function useDataConnectQuery<Data = unknown, Variables = unknown>(refOrResult: QueryRef<Data, Variables> | QueryResult<Data, Variables>, options?: useDataConnectQueryOptions<Data, FirebaseError>, _callerSdkType?: CallerSdkType): UseDataConnectQueryResult<Data, Variables>;

type DataConnectOptions = useDataConnectQueryOptions | useDataConnectQueryOptions;
interface ParsedReactArgs<Variables> {
    dc: DataConnect;
    vars: Variables;
    options: DataConnectOptions;
}
/**
 * The generated React SDK will allow the user to pass in variables, a Data Connect instance, or operation options.
 * The only required argument is the variables, which are only required when the operation has at least one required
 * variable. Otherwise, all arguments are optional. This function validates the variables and returns back the DataConnect
 * instance, variables, and options based on the arguments passed in.
 * @param connectorConfig DataConnect connector config
 * @param dcOrVarsOrOptions the first argument provided to a generated react function
 * @param varsOrOptions the second argument provided to a generated react function
 * @param options the third argument provided to a generated react function
 * @param hasVars boolean parameter indicating whether the operation has variables
 * @param validateVars boolean parameter indicating whether we should expect to find a value for realVars
 * @returns parsed DataConnect, Variables, and Options for the operation
 * @internal
 */
declare function validateReactArgs<Variables extends object>(connectorConfig: ConnectorConfig, dcOrVarsOrOptions?: DataConnect | Variables | DataConnectOptions, varsOrOptions?: Variables | DataConnectOptions, options?: DataConnectOptions, hasVars?: boolean, validateVars?: boolean): ParsedReactArgs<Variables>;

export { DataConnectQueryClient, type DataConnectQueryOptions, type QueryResultRequiredRef, type UseDataConnectMutationResult, type UseDataConnectQueryResult, useDataConnectMutation, type useDataConnectMutationOptions, useDataConnectQuery, type useDataConnectQueryOptions, validateReactArgs };
