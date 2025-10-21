// src/auth/useGetIdTokenQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getIdToken } from "firebase/auth";
var STALE_TIME = 55 * 60 * 1e3;
var GC_TIME = 60 * 60 * 1e3;
var NO_USER_ERROR_MESSAGE = "[useGetIdTokenQuery] Cannot retrieve ID token: no Firebase user provided. Ensure a user is signed in before calling this hook.";
var authQueryKeys = {
  all: ["auth"],
  idToken: (userId, forceRefresh) => [...authQueryKeys.all, "idToken", { userId, forceRefresh }]
};
function useGetIdTokenQuery(user, options) {
  const { auth: authOptions, ...queryOptions } = options || {};
  const forceRefresh = authOptions?.forceRefresh ?? false;
  const queryKey = authQueryKeys.idToken(user?.uid ?? null, forceRefresh);
  const queryFn = () => user ? getIdToken(user, forceRefresh) : Promise.reject(new Error(NO_USER_ERROR_MESSAGE));
  return useQuery({
    ...queryOptions,
    queryKey,
    queryFn,
    staleTime: forceRefresh ? 0 : STALE_TIME,
    gcTime: GC_TIME,
    enabled: options?.enabled !== void 0 ? options.enabled : !!user
  });
}

// src/auth/useApplyActionCodeMutation.ts
import { useMutation } from "@tanstack/react-query";
import { applyActionCode } from "firebase/auth";
function useApplyActionCodeMutation(auth, options) {
  return useMutation({
    ...options,
    mutationFn: (oobCode) => {
      return applyActionCode(auth, oobCode);
    }
  });
}

// src/auth/useCheckActionCodeMutation.ts
import { useMutation as useMutation2 } from "@tanstack/react-query";
import {
  checkActionCode
} from "firebase/auth";
function useCheckActionCodeMutation(auth, options) {
  return useMutation2({
    ...options,
    mutationFn: (oobCode) => checkActionCode(auth, oobCode)
  });
}

// src/auth/useConfirmPasswordResetMutation.ts
import { useMutation as useMutation3 } from "@tanstack/react-query";
import { confirmPasswordReset } from "firebase/auth";
function useConfirmPasswordResetMutation(auth, options) {
  return useMutation3(
    {
      ...options,
      mutationFn: ({ oobCode, newPassword }) => {
        return confirmPasswordReset(auth, oobCode, newPassword);
      }
    }
  );
}

// src/auth/useCreateUserWithEmailAndPasswordMutation.ts
import { useMutation as useMutation4 } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";
function useCreateUserWithEmailAndPasswordMutation(auth, options) {
  return useMutation4({
    ...options,
    mutationFn: ({ email, password }) => createUserWithEmailAndPassword(auth, email, password)
  });
}

// src/auth/useDeleteUserMutation.ts
import { useMutation as useMutation5 } from "@tanstack/react-query";
import {
  deleteUser
} from "firebase/auth";
function useDeleteUserMutation(_auth, options) {
  return useMutation5({
    ...options,
    mutationFn: (user) => deleteUser(user)
  });
}

// src/auth/useGetRedirectResultQuery.ts
import { useQuery as useQuery2 } from "@tanstack/react-query";
import {
  getRedirectResult
} from "firebase/auth";
function useGetRedirectResultQuery(auth, options) {
  const { auth: authOptions, ...queryOptions } = options;
  const resolver = authOptions?.resolver;
  return useQuery2({
    ...queryOptions,
    queryFn: () => getRedirectResult(auth, resolver)
  });
}

// src/auth/useReloadMutation.ts
import { useMutation as useMutation6 } from "@tanstack/react-query";
import { reload } from "firebase/auth";
function useReloadMutation(options) {
  return useMutation6({
    ...options,
    mutationFn: (user) => reload(user)
  });
}

// src/auth/useRevokeAccessTokenMutation.ts
import { useMutation as useMutation7 } from "@tanstack/react-query";
import { revokeAccessToken } from "firebase/auth";
function useRevokeAccessTokenMutation(auth, options) {
  return useMutation7({
    ...options,
    mutationFn: (token) => revokeAccessToken(auth, token)
  });
}

// src/auth/useSendSignInLinkToEmailMutation.ts
import { useMutation as useMutation8 } from "@tanstack/react-query";
import {
  sendSignInLinkToEmail
} from "firebase/auth";
function useSendSignInLinkToEmailMutation(auth, options) {
  return useMutation8({
    ...options,
    mutationFn: ({ email, actionCodeSettings }) => sendSignInLinkToEmail(auth, email, actionCodeSettings)
  });
}

// src/auth/useSignInAnonymouslyMutation.ts
import { useMutation as useMutation9 } from "@tanstack/react-query";
import {
  signInAnonymously
} from "firebase/auth";
function useSignInAnonymouslyMutation(auth, options) {
  return useMutation9({
    ...options,
    mutationFn: () => signInAnonymously(auth)
  });
}

// src/auth/useSignInWithCredentialMutation.ts
import { useMutation as useMutation10 } from "@tanstack/react-query";
import {
  signInWithCredential
} from "firebase/auth";
function useSignInWithCredentialMutation(auth, credential, options) {
  return useMutation10({
    ...options,
    mutationFn: () => signInWithCredential(auth, credential)
  });
}

// src/auth/useSignInWithEmailAndPasswordMutation.ts
import { useMutation as useMutation11 } from "@tanstack/react-query";
import {
  signInWithEmailAndPassword
} from "firebase/auth";
function useSignInWithEmailAndPasswordMutation(auth, options) {
  return useMutation11({
    ...options,
    mutationFn: ({ email, password }) => signInWithEmailAndPassword(auth, email, password)
  });
}

// src/auth/useSignOutMutation.ts
import { useMutation as useMutation12 } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
function useSignOutMutation(auth, options) {
  return useMutation12({
    ...options,
    mutationFn: () => signOut(auth)
  });
}

// src/auth/useUpdateCurrentUserMutation.ts
import { useMutation as useMutation13 } from "@tanstack/react-query";
import {
  updateCurrentUser
} from "firebase/auth";
function useUpdateCurrentUserMutation(auth, options) {
  return useMutation13({
    ...options,
    mutationFn: (user) => updateCurrentUser(auth, user)
  });
}

// src/auth/useVerifyPasswordResetCodeMutation.ts
import { useMutation as useMutation14 } from "@tanstack/react-query";
import {
  verifyPasswordResetCode
} from "firebase/auth";
function useVerifyPasswordResetCodeMutation(auth, options) {
  return useMutation14({
    ...options,
    mutationFn: (code) => verifyPasswordResetCode(auth, code)
  });
}
export {
  useApplyActionCodeMutation,
  useCheckActionCodeMutation,
  useConfirmPasswordResetMutation,
  useCreateUserWithEmailAndPasswordMutation,
  useDeleteUserMutation,
  useGetIdTokenQuery,
  useGetRedirectResultQuery,
  useReloadMutation,
  useRevokeAccessTokenMutation,
  useSendSignInLinkToEmailMutation,
  useSignInAnonymouslyMutation,
  useSignInWithCredentialMutation,
  useSignInWithEmailAndPasswordMutation,
  useSignOutMutation,
  useUpdateCurrentUserMutation,
  useVerifyPasswordResetCodeMutation
};
