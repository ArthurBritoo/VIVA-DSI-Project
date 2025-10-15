// src/firestore/useAddDocumentMutation.ts
import { useMutation } from "@tanstack/react-query";
import {
  addDoc
} from "firebase/firestore";
function useAddDocumentMutation(collectionRef, options) {
  return useMutation({
    ...options,
    mutationFn: (data) => addDoc(collectionRef, data)
  });
}

// src/firestore/useClearIndexedDbPersistenceMutation.ts
import { useMutation as useMutation2 } from "@tanstack/react-query";
import {
  clearIndexedDbPersistence
} from "firebase/firestore";
function useClearIndexedDbPersistenceMutation(firestore, options) {
  return useMutation2({
    ...options,
    mutationFn: () => clearIndexedDbPersistence(firestore)
  });
}

// src/firestore/useCollectionQuery.ts
import { useQuery } from "@tanstack/react-query";
import {
  getDocs,
  getDocsFromCache,
  getDocsFromServer
} from "firebase/firestore";
function useCollectionQuery(query, options) {
  const { firestore, ...queryOptions } = options;
  return useQuery({
    ...queryOptions,
    queryFn: async () => {
      if (firestore?.source === "server") {
        return await getDocsFromServer(query);
      }
      if (firestore?.source === "cache") {
        return await getDocsFromCache(query);
      }
      return await getDocs(query);
    }
  });
}

// src/firestore/useDeleteDocumentMutation.ts
import { useMutation as useMutation3 } from "@tanstack/react-query";
import {
  deleteDoc
} from "firebase/firestore";
function useDeleteDocumentMutation(documentRef, options) {
  return useMutation3({
    ...options,
    mutationFn: () => deleteDoc(documentRef)
  });
}

// src/firestore/useDisableNetworkMutation.ts
import { useMutation as useMutation4 } from "@tanstack/react-query";
import {
  disableNetwork
} from "firebase/firestore";
function useDisableNetworkMutation(firestore, options) {
  return useMutation4({
    ...options,
    mutationFn: () => disableNetwork(firestore)
  });
}

// src/firestore/useDocumentQuery.ts
import { useQuery as useQuery2 } from "@tanstack/react-query";
import {
  getDoc,
  getDocFromCache,
  getDocFromServer
} from "firebase/firestore";
function useDocumentQuery(documentRef, options) {
  const { firestore, ...queryOptions } = options;
  return useQuery2(
    {
      ...queryOptions,
      queryFn: async () => {
        if (firestore?.source === "server") {
          return await getDocFromServer(documentRef);
        }
        if (firestore?.source === "cache") {
          return await getDocFromCache(documentRef);
        }
        return await getDoc(documentRef);
      }
    }
  );
}

// src/firestore/useEnableNetworkMutation.ts
import { useMutation as useMutation5 } from "@tanstack/react-query";
import {
  enableNetwork
} from "firebase/firestore";
function useEnableNetworkMutation(firestore, options) {
  return useMutation5({
    ...options,
    mutationFn: () => enableNetwork(firestore)
  });
}

// src/firestore/useGetAggregateFromServerQuery.ts
import { useQuery as useQuery3 } from "@tanstack/react-query";
import {
  getAggregateFromServer
} from "firebase/firestore";
function useGetAggregateFromServerQuery(query, aggregateSpec, options) {
  return useQuery3({
    ...options,
    queryFn: () => getAggregateFromServer(query, aggregateSpec)
  });
}

// src/firestore/useGetCountFromServerQuery.ts
import { useQuery as useQuery4 } from "@tanstack/react-query";
import {
  getCountFromServer
} from "firebase/firestore";
function useGetCountFromServerQuery(query, options) {
  return useQuery4({
    ...options,
    queryFn: () => getCountFromServer(query)
  });
}

// src/firestore/useNamedQuery.ts
import { useQuery as useQuery5 } from "@tanstack/react-query";
import {
  namedQuery
} from "firebase/firestore";
function useNamedQuery(firestore, name, options) {
  return useQuery5({
    ...options,
    queryFn: () => namedQuery(firestore, name)
  });
}

// src/firestore/useRunTransactionMutation.ts
import { useMutation as useMutation6 } from "@tanstack/react-query";
import {
  runTransaction
} from "firebase/firestore";
function useRunTransactionMutation(firestore, updateFunction, options) {
  const { firestore: firestoreOptions, ...queryOptions } = options ?? {};
  return useMutation6({
    ...queryOptions,
    mutationFn: () => runTransaction(firestore, updateFunction, firestoreOptions)
  });
}

// src/firestore/useSetDocumentMutation.ts
import { useMutation as useMutation7 } from "@tanstack/react-query";
import {
  setDoc
} from "firebase/firestore";
function useSetDocumentMutation(documentRef, options) {
  return useMutation7({
    ...options,
    mutationFn: (data) => setDoc(documentRef, data)
  });
}

// src/firestore/useUpdateDocumentMutation.ts
import { useMutation as useMutation8 } from "@tanstack/react-query";
import {
  updateDoc
} from "firebase/firestore";
function useUpdateDocumentMutation(documentRef, options) {
  return useMutation8({
    ...options,
    mutationFn: (data) => updateDoc(documentRef, data)
  });
}

// src/firestore/useWaitForPendingWritesQuery.ts
import { useQuery as useQuery6 } from "@tanstack/react-query";
import {
  waitForPendingWrites
} from "firebase/firestore";
function useWaitForPendingWritesQuery(firestore, options) {
  return useQuery6({
    ...options,
    queryFn: () => waitForPendingWrites(firestore)
  });
}

// src/firestore/useWriteBatchCommitMutation.ts
import { useMutation as useMutation9 } from "@tanstack/react-query";
function useWriteBatchCommitMutation(options) {
  return useMutation9({
    ...options,
    mutationFn: (batch) => batch.commit()
  });
}
export {
  useAddDocumentMutation,
  useClearIndexedDbPersistenceMutation,
  useCollectionQuery,
  useDeleteDocumentMutation,
  useDisableNetworkMutation,
  useDocumentQuery,
  useEnableNetworkMutation,
  useGetAggregateFromServerQuery,
  useGetCountFromServerQuery,
  useNamedQuery,
  useRunTransactionMutation,
  useSetDocumentMutation,
  useUpdateDocumentMutation,
  useWaitForPendingWritesQuery,
  useWriteBatchCommitMutation
};
