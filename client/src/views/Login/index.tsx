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
import { loginSchema } from "./components/validationSchema";
// Utils Imports
import { onKeyDown } from "../../utils";
// Images Imports
import BottomLogo from "../../assets/images/bottomLogo.svg";
// Redux API
import { useLoginMutation } from "../../redux/api/authApiSlice";
import { setUser } from "../../redux/auth/authSlice";
import BackgroundImage from "../../assets/images/photo1.png";

interface ISLoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // states
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"user" | "doctor" | "admin">("user");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formValues, setFormValues] = useState<ISLoginForm>({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const hideShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  // Login Api Bind
  const [loginUser, { isLoading }] = useLoginMutation();

  const LoginHandler = async (data: ISLoginForm) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        role: loginType,
      };

      const user: any = await loginUser(payload);
      if (user?.data?.status) {
        dispatch(setUser(user?.data));
        localStorage.setItem("user", JSON.stringify(user?.data));
        navigate("/dashboard");
      }
      if (user?.error) {
        setToast({
          ...toast,
          message: user?.error?.data?.message,
          appearence: true,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
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
                  {loginType === "user" ? "WELCOME TO BOOK A DOCTOR" : loginType === "doctor" ? "WELCOME DOCTOR" : "WELCOME ADMIN"}
                </Typography>
                <Typography
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#1a202c",
                    fontWeight: "600",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "24px",
                    marginBottom: "32px"
                  }}
                  variant="h5"
                >
                  Login
                </Typography>
                <Formik
                  initialValues={formValues}
                  onSubmit={(values: ISLoginForm) => {
                    LoginHandler(values);
                  }}
                  validationSchema={loginSchema}
                >
                  {(props: FormikProps<ISLoginForm>) => {
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
                            placeholder="Enter your email"
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
                        <Box sx={{ height: "95px" }}>
                          <SubHeading sx={{
                            marginBottom: "8px",
                            color: "#2d3748",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "500",
                            fontSize: "14px"
                          }}>Password</SubHeading>
                          <PrimaryInput
                            type={showPassword ? "text" : "password"}
                            label=""
                            name="password"
                            placeholder="Enter your password"
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

                        {/* Forgot Password Link */}
                        <Box sx={{ textAlign: "right", marginTop: "-15px", marginBottom: "10px" }}>
                          <Link to="/forgot-password" style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textDecoration: "none",
                            fontFamily: "'Poppins', sans-serif"
                          }}>
                            Forgot Password?
                          </Link>
                        </Box>

                        {/* New Here? Create a New Account section */}
                        <Box sx={{ textAlign: "center", marginTop: "10px" }}>
                          <Typography sx={{
                            color: "#4a5568",
                            fontSize: "15px",
                            fontFamily: "'Poppins', sans-serif"
                          }}>
                            New here?{" "}
                            <Link to="/signup" style={{
                              fontWeight: "600",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              textDecoration: "none",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              Create a new account
                            </Link>
                          </Typography>
                        </Box>

                        {/* Role-based login links */}
                        <Box sx={{ textAlign: "center", marginTop: "15px" }}>
                          {loginType === "user" && (
                            <Typography sx={{
                              color: "#4a5568",
                              fontSize: "14px",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              Are you a doctor?{" "}
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLoginType("doctor");
                                }}
                                style={{
                                  fontWeight: "600",
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  textDecoration: "none",
                                  fontFamily: "'Poppins', sans-serif",
                                  cursor: "pointer"
                                }}
                              >
                                Click here for Doctor Login
                              </a>
                            </Typography>
                          )}

                          {loginType === "doctor" && (
                            <>
                              <Typography sx={{
                                color: "#667eea",
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "'Poppins', sans-serif",
                                marginBottom: "8px"
                              }}>
                                Please login to check appointments
                              </Typography>
                              <Typography sx={{
                                color: "#4a5568",
                                fontSize: "14px",
                                fontFamily: "'Poppins', sans-serif"
                              }}>
                                Are you an admin?{" "}
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setLoginType("admin");
                                  }}
                                  style={{
                                    fontWeight: "600",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textDecoration: "none",
                                    fontFamily: "'Poppins', sans-serif",
                                    cursor: "pointer"
                                  }}
                                >
                                  Click here for Admin Login
                                </a>
                              </Typography>
                            </>
                          )}

                          {loginType === "admin" && (
                            <>
                              <Typography sx={{
                                color: "#667eea",
                                fontSize: "15px",
                                fontWeight: "600",
                                fontFamily: "'Poppins', sans-serif",
                                marginBottom: "8px"
                              }}>
                                Please login to handle doctors
                              </Typography>
                              <Typography sx={{
                                color: "#4a5568",
                                fontSize: "14px",
                                fontFamily: "'Poppins', sans-serif"
                              }}>
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setLoginType("user");
                                  }}
                                  style={{
                                    fontWeight: "600",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textDecoration: "none",
                                    fontFamily: "'Poppins', sans-serif",
                                    cursor: "pointer"
                                  }}
                                >
                                  Back to User Login
                                </a>
                              </Typography>
                            </>
                          )}
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
                            {isLoading ? "Logging in..." : "Login"}
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

export default Login;
