// React Imports
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// Formik Imports
import { Form, Formik, FormikProps } from "formik";
// MUI Imports
import { Button, Box, Typography } from "@mui/material";
// Custom Imports
import { SubHeading } from "../../components/Heading";
import PrimaryInput from "../../components/PrimaryInput/PrimaryInput";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
// React Icons Imports
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
// Validation Schema Imports
import { resetPasswordSchema } from "./components/validationSchema";
// Utils Imports
import { onKeyDown } from "../../utils";
// Images Imports
import BottomLogo from "../../assets/images/bottomLogo.svg";
import BackgroundImage from "../../assets/images/photo1.png";
// Redux API
import { useResetPasswordMutation } from "../../redux/api/authApiSlice";
import { setUser } from "../../redux/auth/authSlice";

interface IResetPasswordForm {
    token: string;
    password: string;
    confirmPassword: string;
}

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formValues, setFormValues] = useState<IResetPasswordForm>({
        token: "",
        password: "",
        confirmPassword: "",
    });
    const [toast, setToast] = useState({
        message: "",
        appearence: false,
        type: "",
    });

    const hideShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const hideShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleCloseToast = () => {
        setToast({ ...toast, appearence: false });
    };

    // Reset Password Api Bind
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const ResetPasswordHandler = async (data: IResetPasswordForm) => {
        try {
            const payload = {
                token: data.token,
                password: data.password,
            };

            const response: any = await resetPassword(payload);
            if (response?.data?.status === "success") {
                dispatch(setUser(response?.data));
                localStorage.setItem("user", JSON.stringify(response?.data));
                setToast({
                    ...toast,
                    message: "Password reset successful! Redirecting to dashboard...",
                    appearence: true,
                    type: "success",
                });
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            }
            if (response?.error) {
                setToast({
                    ...toast,
                    message: response?.error?.data?.message,
                    appearence: true,
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Reset Password Error:", error);
            setToast({
                ...toast,
                message: "Something went wrong",
                appearence: true,
                type: "error",
            });
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    height: "100vh",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "fixed",
                        bottom: "0",
                        right: "-175px",
                        "@media (max-width: 576px)": {
                            display: "none",
                        },
                    }}
                >
                    <img
                        src={BottomLogo}
                        alt="bottom logo"
                        style={{ transform: "rotate(-6deg)", height: "200px" }}
                    />
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "row",
                        "@media (max-width: 768px)": {
                            flexDirection: "column-reverse",
                        },
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: "600px",
                                padding: "0 40px",
                                "@media (min-width: 1500px)": {
                                    padding: "0 50px",
                                    maxWidth: "650px",
                                },
                                "@media (min-width: 768px) and (max-width: 991px)": {
                                    padding: "0 45px",
                                },
                                "@media (min-width: 576px) and (max-width: 767px)": {
                                    padding: "0 50px",
                                    maxWidth: "600px",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: "22px", sm: "26px", md: "30px" },
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: "700",
                                        fontFamily: "'Poppins', sans-serif",
                                        letterSpacing: "-0.5px",
                                        marginBottom: "8px",
                                        textAlign: "center",
                                        lineHeight: "1.2",
                                    }}
                                    component="h1"
                                >
                                    RESET PASSWORD
                                </Typography>
                                <Typography
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "#4a5568",
                                        fontWeight: "400",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "16px",
                                        marginBottom: "32px",
                                        textAlign: "center",
                                    }}
                                    variant="body1"
                                >
                                    Enter your reset token and new password
                                </Typography>
                                <Formik
                                    initialValues={formValues}
                                    onSubmit={(values: IResetPasswordForm) => {
                                        ResetPasswordHandler(values);
                                    }}
                                    validationSchema={resetPasswordSchema}
                                >
                                    {(props: FormikProps<IResetPasswordForm>) => {
                                        const {
                                            values,
                                            touched,
                                            errors,
                                            handleBlur,
                                            handleChange,
                                        } = props;

                                        return (
                                            <Form onKeyDown={onKeyDown}>
                                                <Box sx={{ height: "95px", marginTop: "20px" }}>
                                                    <SubHeading sx={{
                                                        marginBottom: "8px",
                                                        color: "#2d3748",
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontWeight: "500",
                                                        fontSize: "14px"
                                                    }}>Reset Token</SubHeading>
                                                    <PrimaryInput
                                                        type="text"
                                                        label=""
                                                        name="token"
                                                        placeholder="Enter your reset token"
                                                        value={values.token}
                                                        helperText={errors.token && touched.token ? errors.token : ""}
                                                        error={errors.token && touched.token ? true : false}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                fontFamily: "'Poppins', sans-serif",
                                                                '&:hover fieldset': {
                                                                    borderColor: '#667eea',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#667eea',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ height: "95px" }}>
                                                    <SubHeading sx={{
                                                        marginBottom: "8px",
                                                        color: "#2d3748",
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontWeight: "500",
                                                        fontSize: "14px"
                                                    }}>New Password</SubHeading>
                                                    <PrimaryInput
                                                        type={showPassword ? "text" : "password"}
                                                        label=""
                                                        name="password"
                                                        placeholder="Enter your new password"
                                                        value={values.password}
                                                        helperText={errors.password && touched.password ? errors.password : ""}
                                                        error={errors.password && touched.password ? true : false}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onClick={hideShowPassword}
                                                        endAdornment={
                                                            showPassword ? (
                                                                <AiOutlineEye color="#667eea" />
                                                            ) : (
                                                                <AiOutlineEyeInvisible color="#667eea" />
                                                            )
                                                        }
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                fontFamily: "'Poppins', sans-serif",
                                                                '&:hover fieldset': {
                                                                    borderColor: '#667eea',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#667eea',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ height: "95px" }}>
                                                    <SubHeading sx={{
                                                        marginBottom: "8px",
                                                        color: "#2d3748",
                                                        fontFamily: "'Poppins', sans-serif",
                                                        fontWeight: "500",
                                                        fontSize: "14px"
                                                    }}>Confirm Password</SubHeading>
                                                    <PrimaryInput
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        label=""
                                                        name="confirmPassword"
                                                        placeholder="Confirm your new password"
                                                        value={values.confirmPassword}
                                                        helperText={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : ""}
                                                        error={errors.confirmPassword && touched.confirmPassword ? true : false}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        onClick={hideShowConfirmPassword}
                                                        endAdornment={
                                                            showConfirmPassword ? (
                                                                <AiOutlineEye color="#667eea" />
                                                            ) : (
                                                                <AiOutlineEyeInvisible color="#667eea" />
                                                            )
                                                        }
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                fontFamily: "'Poppins', sans-serif",
                                                                '&:hover fieldset': {
                                                                    borderColor: '#667eea',
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: '#667eea',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ textAlign: "center", marginTop: "10px" }}>
                                                    <Typography sx={{
                                                        color: "#4a5568",
                                                        fontSize: "15px",
                                                        fontFamily: "'Poppins', sans-serif"
                                                    }}>
                                                        Don't have a token?{" "}
                                                        <Link to="/forgot-password" style={{
                                                            fontWeight: "600",
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            backgroundClip: "text",
                                                            WebkitBackgroundClip: "text",
                                                            WebkitTextFillColor: "transparent",
                                                            textDecoration: "none",
                                                            fontFamily: "'Poppins', sans-serif"
                                                        }}>
                                                            Get Reset Token
                                                        </Link>
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ textAlign: "center", marginTop: "10px" }}>
                                                    <Typography sx={{
                                                        color: "#4a5568",
                                                        fontSize: "15px",
                                                        fontFamily: "'Poppins', sans-serif"
                                                    }}>
                                                        Remember your password?{" "}
                                                        <Link to="/login" style={{
                                                            fontWeight: "600",
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            backgroundClip: "text",
                                                            WebkitBackgroundClip: "text",
                                                            WebkitTextFillColor: "transparent",
                                                            textDecoration: "none",
                                                            fontFamily: "'Poppins', sans-serif"
                                                        }}>
                                                            Back to Login
                                                        </Link>
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: "flex", justifyContent: "end", marginTop: "24px" }}>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        fullWidth
                                                        disabled={isLoading}
                                                        sx={{
                                                            padding: "14px 30px",
                                                            textTransform: "capitalize",
                                                            margin: "20px 0",
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            fontFamily: "'Poppins', sans-serif",
                                                            fontWeight: "600",
                                                            fontSize: "16px",
                                                            borderRadius: "12px",
                                                            boxShadow: "0 4px 15px 0 rgba(102, 126, 234, 0.4)",
                                                            transition: "all 0.3s ease",
                                                            '&:hover': {
                                                                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                                                                boxShadow: "0 6px 20px 0 rgba(102, 126, 234, 0.6)",
                                                                transform: "translateY(-2px)",
                                                            },
                                                            '&:active': {
                                                                transform: "translateY(0)",
                                                            },
                                                            '&:disabled': {
                                                                background: "#cbd5e0",
                                                                boxShadow: "none",
                                                            },
                                                        }}
                                                    >
                                                        {isLoading ? "Resetting Password..." : "Reset Password"}
                                                    </Button>
                                                </Box>
                                            </Form>

                                        );
                                    }}
                                </Formik>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            backgroundImage: `url(${BackgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            position: "relative",
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                pointerEvents: 'none',
                            },
                        }}
                    >
                    </Box>
                </Box>
            </Box>
            <ToastAlert
                appearence={toast.appearence}
                type={toast.type}
                message={toast.message}
                handleClose={handleCloseToast}
            />
        </>
    );
};

export default ResetPassword;
