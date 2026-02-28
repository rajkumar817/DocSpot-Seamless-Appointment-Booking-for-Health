import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApiSlice = createApi({
    reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_API_URL,
        prepareHeaders: (headers) => {
            const user = localStorage.getItem("user");
            if (user) {
                const parsedUser = JSON.parse(user);
                headers.set("authorization", `Bearer ${parsedUser.token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["SystemActivity"],
    endpoints: (builder) => ({
        getSystemActivity: builder.query({
            query: ({ page = 1, limit = 20 }) =>
                `/admin/system-activity?page=${page}&limit=${limit}`,
            providesTags: ["SystemActivity"],
        }),
    }),
});

export const { useGetSystemActivityQuery } = adminApiSlice;
