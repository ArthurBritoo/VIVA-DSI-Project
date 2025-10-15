// src/data-connect/query-client.ts
import {
  QueryClient
} from "@tanstack/react-query";
import {
  executeQuery
} from "firebase/data-connect";
var DataConnectQueryClient = class extends QueryClient {
  prefetchDataConnectQuery(refOrResult, options) {
    let queryRef;
    let initialData;
    if ("ref" in refOrResult) {
      queryRef = refOrResult.ref;
      initialData = {
        ...refOrResult.data,
        ref: refOrResult.ref,
        source: refOrResult.source,
        fetchTime: refOrResult.fetchTime
      };
    } else {
      queryRef = refOrResult;
    }
    return this.prefetchQuery({
      ...options,
      initialData,
      queryKey: options?.queryKey ?? [
        queryRef.name,
        queryRef.variables || null
      ],
      queryFn: async () => {
        const response = await executeQuery(queryRef);
        const data = {
          ...response.data,
          ref: response.ref,
          source: response.source,
          fetchTime: response.fetchTime
        };
        return JSON.parse(JSON.stringify(data));
      }
    });
  }
};

// src/data-connect/useDataConnectMutation.ts
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import {
  CallerSdkTypeEnum,
  executeMutation
} from "firebase/data-connect";
import { useState } from "react";
function useDataConnectMutation(ref, options, _callerSdkType = CallerSdkTypeEnum.TanstackReactCore) {
  const queryClient = useQueryClient();
  const [dataConnectResult, setDataConnectResult] = useState(void 0);
  const originalResult = useMutation({
    ...options,
    onSuccess(...args) {
      if (options?.invalidate?.length) {
        for (const ref2 of options.invalidate) {
          if ("variables" in ref2 && ref2.variables !== void 0) {
            queryClient.invalidateQueries({
              queryKey: [ref2.name, ref2.variables],
              exact: true
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: [ref2.name]
            });
          }
        }
      }
      options?.onSuccess?.(...args);
    },
    mutationFn: async (variables) => {
      const mutationRef = typeof ref === "function" ? ref(variables) : ref;
      mutationRef.dataConnect._setCallerSdkType(_callerSdkType);
      const response = await executeMutation(mutationRef);
      setDataConnectResult(response);
      return {
        ...response.data
      };
    }
  });
  return {
    dataConnectResult,
    ...originalResult
  };
}

// src/data-connect/useDataConnectQuery.ts
import { useQuery } from "@tanstack/react-query";
import {
  CallerSdkTypeEnum as CallerSdkTypeEnum2,
  executeQuery as executeQuery2
} from "firebase/data-connect";
import { useEffect, useState as useState2 } from "react";

// src/data-connect/utils.ts
function deepEqual(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === "object" && a !== null) {
    if (a === b) {
      return true;
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let index = 0; index < a.length; index++) {
        const elementA = a[index];
        const elementB = b[index];
        const isEqual = deepEqual(elementA, elementB);
        if (!isEqual) {
          return false;
        }
      }
      return true;
    }
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {
      return false;
    }
    for (const key of keys) {
      const isEqual = deepEqual(
        a[key],
        b[key]
      );
      if (!isEqual) {
        return false;
      }
    }
    return true;
  }
  return a === b;
}

// src/data-connect/useDataConnectQuery.ts
function getRef(refOrResult) {
  return "ref" in refOrResult ? refOrResult.ref : refOrResult;
}
function useDataConnectQuery(refOrResult, options, _callerSdkType = CallerSdkTypeEnum2.TanstackReactCore) {
  const [dataConnectResult, setDataConnectResult] = useState2("ref" in refOrResult ? refOrResult : { ref: refOrResult });
  const [ref, setRef] = useState2(dataConnectResult.ref);
  const [initialData] = useState2(
    dataConnectResult.data || options?.initialData
  );
  useEffect(() => {
    setRef((oldRef) => {
      const newRef = getRef(refOrResult);
      if (newRef.name !== oldRef.name || !deepEqual(oldRef.variables, newRef.variables)) {
        return newRef;
      }
      return oldRef;
    });
  }, [refOrResult]);
  ref.dataConnect._setCallerSdkType(_callerSdkType);
  const useQueryResult = useQuery({
    ...options,
    initialData,
    queryKey: options?.queryKey ?? [ref.name, ref.variables || null],
    queryFn: async () => {
      const response = await executeQuery2(ref);
      setDataConnectResult(response);
      return {
        ...response.data
      };
    }
  });
  return {
    ...useQueryResult,
    dataConnectResult
  };
}

// src/data-connect/validateReactArgs.ts
import {
  getDataConnect
} from "firebase/data-connect";
function validateReactArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, hasVars, validateVars) {
  let dcInstance;
  let realVars;
  let realOptions;
  if (dcOrVarsOrOptions && "enableEmulator" in dcOrVarsOrOptions) {
    dcInstance = dcOrVarsOrOptions;
    if (hasVars) {
      realVars = varsOrOptions;
      realOptions = options;
    } else {
      realVars = void 0;
      realOptions = varsOrOptions;
    }
  } else {
    dcInstance = getDataConnect(connectorConfig);
    if (hasVars) {
      realVars = dcOrVarsOrOptions;
      realOptions = varsOrOptions;
    } else {
      realVars = void 0;
      realOptions = dcOrVarsOrOptions;
    }
  }
  if (!dcInstance || !realVars && validateVars) {
    throw new Error("invalid-argument: Variables required.");
  }
  return { dc: dcInstance, vars: realVars, options: realOptions };
}
export {
  DataConnectQueryClient,
  useDataConnectMutation,
  useDataConnectQuery,
  validateReactArgs
};
