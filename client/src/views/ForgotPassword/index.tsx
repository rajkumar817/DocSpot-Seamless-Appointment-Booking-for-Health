// React Imports
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Formik Imports
import { Form, Formik, FormikProps } from "formik";
// MUI Imports
import { Button, Box, Typography } from "@mui/material";
// Custom Imports
import { SubHeading } from "../../components/Heading";
import PrimaryInput from "../../components/PrimaryInput/PrimaryInput";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
// Validation Schema Imports
import { forgotPasswordSchema } from "./components/validationSchema";
// Utils Imports
import { onKeyDown } from "../../utils";
// Images Imports
import BottomLogo from "../../assets/images/bottomLogo.svg";
import BackgroundImage from "../../assets/images/photo1.png";
// Redux API
import { useForgotPasswordMutation } from "../../redux/api/authApiSlice";

interface IForgotPasswordForm {
    email: string;
}

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState<IForgotPasswordForm>({
        email: "",
    });
    const [resetToken, setResetToken] = useState("");
    const [toast, setToast] = useState({
        message: "",
        appearence: false,
        type: "",
    });

    const handleCloseToast = () => {
        setToast({ ...toast, appearence: false });
    };

    // Forgot Password Api Bind
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const ForgotPasswordHandler = async (data: IForgotPasswordForm) => {
        try {
            const payload = {
                email: data.email,
            };

            const response: any = await forgotPassword(payload);
            if (response?.data?.status === "success") {
                setResetToken(response.data.resetToken);
                setToast({
                    ...toast,
                    message: "Reset token generated! Please save it and use it to reset your password.",
                    appearence: true,
                    type: "success",
                });
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
            console.error("Forgot Password Error:", error);
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
                                    FORGOT PASSWORD
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
                                    Enter your email to receive a password reset token
                                </Typography>
                                <Formik
                                    initialValues={formValues}
                                    onSubmit={(values: IForgotPasswordForm) => {
                                        ForgotPasswordHandler(values);
                                    }}
                                    validationSchema={forgotPasswordSchema}
                                >
                                    {(props: FormikProps<IForgotPasswordForm>) => {
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
                                                    }}>Email</SubHeading>
                                                    <PrimaryInput
                                                        type="text"
                                                        label=""
                                                        name="email"
                                                        placeholder="Enter your registered email"
                                                        value={values.email}
                                                        helperText={errors.email && touched.email ? errors.email : ""}
                                                        error={errors.email && touched.email ? true : false}
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

                                                {resetToken && (
                                                    <Box sx={{
                                                        marginTop: "20px",
                                                        padding: "16px",
                                                        background: "#f0fdf4",
                                                        border: "1px solid #86efac",
                                                        borderRadius: "8px",
                                                    }}>
                                                        <Typography sx={{
                                                            color: "#166534",
                                                            fontFamily: "'Poppins', sans-serif",
                                                            fontSize: "14px",
                                                            fontWeight: "600",
                                                            marginBottom: "8px",
                                                        }}>
                                                            Your Reset Token:
                                                        </Typography>
                                                        <Typography sx={{
                                                            color: "#15803d",
                                                            fontFamily: "'Courier New', monospace",
                                                            fontSize: "12px",
                                                            wordBreak: "break-all",
                                                            background: "#dcfce7",
                                                            padding: "8px",
                                                            borderRadius: "4px",
                                                        }}>
                                                            {resetToken}
                                                        </Typography>
                                                        <Typography sx={{
                                                            color: "#166534",
                                                            fontFamily: "'Poppins', sans-serif",
                                                            fontSize: "12px",
                                                            marginTop: "8px",
                                                        }}>
                                                            Copy this token and use it on the reset password page.
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Box sx={{ textAlign: "center", marginTop: "20px" }}>
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

                                                {resetToken && (
                                                    <Box sx={{ textAlign: "center", marginTop: "10px" }}>
                                                        <Typography sx={{
                                                            color: "#4a5568",
                                                            fontSize: "15px",
                                                            fontFamily: "'Poppins', sans-serif"
                                                        }}>
                                                            <Link to="/reset-password" style={{
                                                                fontWeight: "600",
                                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                                backgroundClip: "text",
                                                                WebkitBackgroundClip: "text",
                                                                WebkitTextFillColor: "transparent",
                                                                textDecoration: "none",
                                                                fontFamily: "'Poppins', sans-serif"
                                                            }}>
                                                                Go to Reset Password Page
                                                            </Link>
                                                        </Typography>
                                                    </Box>
                                                )}

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
                                                        {isLoading ? "Generating Token..." : "Get Reset Token"}
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

export default ForgotPassword;
