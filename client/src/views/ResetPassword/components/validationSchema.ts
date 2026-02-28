import * as Yup from "yup";

export const resetPasswordSchema = Yup.object({
    token: Yup.string()
        .required("Reset token is required")
        .min(10, "Invalid token format"),
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
});
