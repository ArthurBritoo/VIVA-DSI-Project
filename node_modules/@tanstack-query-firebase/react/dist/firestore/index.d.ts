import * as _tanstack_react_query from '@tanstack/react-query';
import { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { DocumentData, CollectionReference, WithFieldValue, DocumentReference, FirestoreError, Firestore, Query, QuerySnapshot, DocumentSnapshot, AggregateSpec, AggregateQuerySnapshot, AggregateField, Transaction, TransactionOptions, UpdateData, WriteBatch } from 'firebase/firestore';

type FirestoreUseMutationOptions$7<TData = unknown, TError = Error, AppModelType extends DocumentData = DocumentData> = Omit<UseMutationOptions<TData, TError, WithFieldValue<AppModelType>>, "mutationFn">;
declare function useAddDocumentMutation<AppModelType extends DocumentData = DocumentData, DbModelType extends DocumentData = DocumentData>(collectionRef: CollectionReference<AppModelType, DbModelType>, options?: FirestoreUseMutationOptions$7<DocumentReference<AppModelType, DbModelType>, FirestoreError, AppModelType>): _tanstack_react_query.UseMutationResult<DocumentReference<AppModelType, DbModelType>, FirestoreError, WithFieldValue<AppModelType>, unknown>;

type UseFirestoreMutationOptions<TData = unknown, TError = Error> = Omit<UseMutationOptions<TData, TError, void>, "mutationFn">;
declare function useClearIndexedDbPersistenceMutation(firestore: Firestore, options?: UseFirestoreMutationOptions<void, FirestoreError>): _tanstack_react_query.UseMutationResult<void, FirestoreError, void, unknown>;

type FirestoreUseQueryOptions$5<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError>, "queryFn"> & {
    firestore?: {
        source?: "server" | "cache";
    };
};
declare function useCollectionQuery<FromFirestore extends DocumentData = DocumentData, ToFirestore extends DocumentData = DocumentData>(query: Query<FromFirestore, ToFirestore>, options: FirestoreUseQueryOptions$5<QuerySnapshot<FromFirestore, ToFirestore>, FirestoreError>): _tanstack_react_query.UseQueryResult<QuerySnapshot<FromFirestore, ToFirestore>, FirestoreError>;

type FirestoreUseMutationOptions$6<TData = unknown, TError = Error> = Omit<UseMutationOptions<TData, TError, void>, "mutationFn">;
declare function useDeleteDocumentMutation<AppModelType extends DocumentData = DocumentData, DbModelType extends DocumentData = DocumentData>(documentRef: DocumentReference<AppModelType, DbModelType>, options?: FirestoreUseMutationOptions$6<void, FirestoreError>): _tanstack_react_query.UseMutationResult<void, FirestoreError, void, unknown>;

type FirestoreUseMutationOptions$5<TData = unknown, TError = Error> = Omit<UseMutationOptions<TData, TError, void>, "mutationFn">;
declare function useDisableNetworkMutation(firestore: Firestore, options?: FirestoreUseMutationOptions$5<void, FirestoreError>): _tanstack_react_query.UseMutationResult<void, FirestoreError, void, unknown>;

type FirestoreUseQueryOptions$4<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError>, "queryFn"> & {
    firestore?: {
        source?: "server" | "cache";
    };
};
declare function useDocumentQuery<FromFirestore extends DocumentData = DocumentData, ToFirestore extends DocumentData = DocumentData>(documentRef: DocumentReference<FromFirestore, ToFirestore>, options: FirestoreUseQueryOptions$4<DocumentSnapshot<FromFirestore, ToFirestore>, FirestoreError>): _tanstack_react_query.UseQueryResult<DocumentSnapshot<FromFirestore, ToFirestore>, FirestoreError>;

type FirestoreUseMutationOptions$4<TData = unknown, TError = Error> = Omit<UseMutationOptions<TData, TError, void>, "mutationFn">;
declare function useEnableNetworkMutation(firestore: Firestore, options?: FirestoreUseMutationOptions$4<void, FirestoreError>): _tanstack_react_query.UseMutationResult<void, FirestoreError, void, unknown>;

type FirestoreUseQueryOptions$3<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError>, "queryFn">;
declare function useGetAggregateFromServerQuery<T extends AggregateSpec, AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(query: Query<AppModelType, DbModelType>, aggregateSpec: T, options: FirestoreUseQueryOptions$3<AggregateQuerySnapshot<T, AppModelType, DbModelType>, FirestoreError>): _tanstack_react_query.UseQueryResult<AggregateQuerySnapshot<T, AppModelType, DbModelType>, FirestoreError>;

type FirestoreUseQueryOptions$2<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError>, "queryFn">;
declare function useGetCountFromServerQuery<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData>(query: Query<AppModelType, DbModelType>, options: FirestoreUseQueryOptions$2<AggregateQuerySnapshot<{
    count: AggregateField<number>;
}, AppModelType, DbModelType>, FirestoreError>): _tanstack_react_query.UseQueryResult<AggregateQuerySnapshot<{
    count: AggregateField<number>;
}, AppModelType, DbModelType>, FirestoreError>;

type FirestoreUseQueryOptions$1<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError>, "queryFn">;
declare function useNamedQuery<_AppModelType = DocumentData, _DbModelType extends DocumentData = DocumentData>(firestore: Firestore, name: string, options: FirestoreUseQueryOptions$1<Query | null, FirestoreError>): _tanstack_react_query.UseQueryResult<Query<DocumentData, DocumentData> | null, FirestoreError>;

type RunTransactionFunction<T> = (transaction: Transaction) => Promise<T>;
type FirestoreUseMutationOptions$3<TData = unknown, TError = Error> = Omit<UseMutationOptions<TData, TError, void>, "mutationFn"> & {
    firestore?: TransactionOptions;
};
declare function useRunTransactionMutation<T>(firestore: Firestore, updateFunction: RunTransactionFunction<T>, options?: FirestoreUseMutationOptions$3<T>): _tanstack_react_query.UseMutationResult<T, FirestoreError, void, unknown>;

type FirestoreUseMutationOptions$2<TData = unknown, TError = Error, AppModelType extends DocumentData = DocumentData> = Omit<UseMutationOptions<TData, TError, WithFieldValue<AppModelType>>, "mutationFn">;
declare function useSetDocumentMutation<AppModelType extends DocumentData = DocumentData, DbModelType extends DocumentData = DocumentData>(documentRef: DocumentReference<AppModelType, DbModelType>, options?: FirestoreUseMutationOptions$2<void, FirestoreError, AppModelType>): _tanstack_react_query.UseMutationResult<void, FirestoreError, WithFieldValue<AppModelType>, unknown>;

type FirestoreUseMutationOptions$1<TData = unknown, TError = Error, DbModelType extends DocumentData = DocumentData> = Omit<UseMutationOptions<TData, TError, UpdateData<DbModelType>>, "mutationFn">;
declare function useUpdateDocumentMutation<AppModelType extends DocumentData = DocumentData, DbModelType extends DocumentData = DocumentData>(documentRef: DocumentReference<AppModelType, DbModelType>, options?: FirestoreUseMutationOptions$1<void, FirestoreError, DbModelType>): _tanstack_react_query.UseMutationResult<void, FirestoreError, UpdateData<DbModelType>, unknown>;

type FirestoreUseQueryOptions<TData = unknown, TError = Error> = Omit<UseQueryOptions<TData, TError, void>, "queryFn">;
declare function useWaitForPendingWritesQuery(firestore: Firestore, options: FirestoreUseQueryOptions<void, FirestoreError>): _tanstack_react_query.UseQueryResult<void, FirestoreError>;

type FirestoreUseMutationOptions<TError = Error> = Omit<UseMutationOptions<void, TError, WriteBatch>, "mutationFn">;
declare function useWriteBatchCommitMutation(options?: FirestoreUseMutationOptions<FirestoreError>): _tanstack_react_query.UseMutationResult<void, FirestoreError, WriteBatch, unknown>;

export { useAddDocumentMutation, useClearIndexedDbPersistenceMutation, useCollectionQuery, useDeleteDocumentMutation, useDisableNetworkMutation, useDocumentQuery, useEnableNetworkMutation, useGetAggregateFromServerQuery, useGetCountFromServerQuery, useNamedQuery, useRunTransactionMutation, useSetDocumentMutation, useUpdateDocumentMutation, useWaitForPendingWritesQuery, useWriteBatchCommitMutation };
