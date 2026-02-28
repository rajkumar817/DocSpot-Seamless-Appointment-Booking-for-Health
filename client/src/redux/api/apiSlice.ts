import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Don't add auth token for public endpoints
      const publicEndpoints = ['login', 'signup', 'forgotPassword', 'resetPassword'];

      if (!publicEndpoints.includes(endpoint)) {
        const state = getState() as RootState;
        const token = state.auth?.user?.token;
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Doctors", "Conversations", "Messages"],
  endpoints: (builder) => ({}),
});
