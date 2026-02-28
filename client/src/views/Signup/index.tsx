// React Imports
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// React Icons
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
// Formik Imports
import { Form, Formik, FormikProps } from "formik";
// Utils Imports
import { onKeyDown } from "../../utils";
// Validation Schema
import { signupSchema } from "./components/validationSchema";
// MUI Imports
import { Box, Button, MenuItem } from "@mui/material";
// Custom Imports
import { Heading, SubHeading } from "../../components/Heading";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
import PrimaryInput from "../../components/PrimaryInput/PrimaryInput";
// Images Imports
import NextWhiteLogo from "../../assets/images/nexCenterLogo.svg";
// Redux API
import { useSignupMutation } from "../../redux/api/authApiSlice";
import PrimaryPhoneInput from "../../components/PhoneInput";
import BackgroundImage from "../../assets/images/doc.png";


interface ISSignupForm {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: string;
  address: string;
  dateOfBirth: string;
  bloodGroup: string;
}

const Signup = () => {
  const navigate = useNavigate();
  // states
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formValues, setFormValues] = useState<ISSignupForm>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "",
    address: "",
    dateOfBirth: "",
    bloodGroup: "",
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

  // Sign Up Api Bind
  const [signupUser, { isLoading }] = useSignupMutation();

  const signupHandler = async (data: ISSignupForm) => {
    const payload = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      gender: data.gender,
      address: data.address,
      dateOfBirth: data.dateOfBirth,
      bloodGroup: data.bloodGroup,
    };
    try {
      const user: any = await signupUser(payload);

      if (user?.data?.status) {
        setToast({
          ...toast,
          message: "User Successfully Created",
          appearence: true,
          type: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
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
      console.error("SignUp Error:", error);
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
            left: "-110px",
            "@media (max-width: 576px)": {
              display: "none",
            },
          }}
        >
          <img src={NextWhiteLogo} alt="logo" style={{ height: 200 }} />
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
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={BackgroundImage}
              alt="Doctor"
              sx={{
                maxWidth: "80%",
                maxHeight: "80%",
                objectFit: "contain",
                opacity: 0.9,
              }}
            />
          </Box>
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
                <Heading
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: "700",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: { xs: "28px", sm: "32px", md: "36px" },
                    marginBottom: "24px",
                  }}
                >
                  Create an Account
                </Heading>
                <Box>
                  <Formik
                    initialValues={formValues}
                    onSubmit={(values: ISSignupForm) => {
                      signupHandler(values);
                    }}
                    validationSchema={signupSchema}
                  >
                    {(props: FormikProps<ISSignupForm>) => {
                      const {
                        values,
                        touched,
                        errors,
                        handleBlur,
                        handleChange,
                      } = props;

                      return (
                        <Form onKeyDown={onKeyDown}>
                          <Box sx={{ marginTop: "20px", height: "95px" }}>
                            <SubHeading sx={{
                              marginBottom: "8px",
                              color: "#2d3748",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "500",
                              fontSize: "14px"
                            }}>Name</SubHeading>
                            <PrimaryInput
                              type="text"
                              label=""
                              name="name"
                              placeholder="Enter your name"
                              value={values.name}
                              helperText={errors.name && touched.name ? errors.name : ""}
                              error={errors.name && touched.name ? true : false}
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
                            }}>Mobile Number</SubHeading>
                            <PrimaryPhoneInput
                              value={props.values.phoneNumber || '+91'}
                              name="phoneNumber"
                              formik={props}
                              variant="outlined"
                              label=""
                            />
                          </Box>

                          <Box sx={{ height: "95px" }}>
                            <SubHeading sx={{
                              marginBottom: "8px",
                              color: "#2d3748",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "500",
                              fontSize: "14px"
                            }}>Gender</SubHeading>
                            <PrimaryInput
                              label=""
                              name="gender"
                              placeholder="Select Gender"
                              value={values.gender}
                              helperText={errors.gender && touched.gender ? errors.gender : ""}
                              error={errors.gender && touched.gender ? true : false}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              select
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </PrimaryInput>
                          </Box>

                          <Box sx={{ height: "95px" }}>
                            <SubHeading sx={{
                              marginBottom: "8px",
                              color: "#2d3748",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "500",
                              fontSize: "14px"
                            }}>Address</SubHeading>
                            <PrimaryInput
                              type="text"
                              label=""
                              name="address"
                              placeholder="Your Address"
                              value={values.address}
                              helperText={errors.address && touched.address ? errors.address : ""}
                              error={errors.address && touched.address ? true : false}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </Box>

                          <Box sx={{ height: "95px" }}>
                            <SubHeading sx={{
                              marginBottom: "8px",
                              color: "#2d3748",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "500",
                              fontSize: "14px"
                            }}>Blood Group</SubHeading>
                            <PrimaryInput
                              type="text"
                              label=""
                              name="bloodGroup"
                              placeholder="e.g. O+, A-"
                              value={values.bloodGroup}
                              helperText={errors.bloodGroup && touched.bloodGroup ? errors.bloodGroup : ""}
                              error={errors.bloodGroup && touched.bloodGroup ? true : false}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </Box>

                          <Box sx={{ height: "95px" }}>
                            <SubHeading sx={{
                              marginBottom: "8px",
                              color: "#2d3748",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "500",
                              fontSize: "14px"
                            }}>Date of Birth</SubHeading>
                            <PrimaryInput
                              type="date"
                              label=""
                              name="dateOfBirth"
                              placeholder=""
                              value={values.dateOfBirth}
                              helperText={errors.dateOfBirth && touched.dateOfBirth ? errors.dateOfBirth : ""}
                              error={errors.dateOfBirth && touched.dateOfBirth ? true : false}
                              onChange={handleChange}
                              onBlur={handleBlur}
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

                          {/* Already Have an Account Section */}
                          <Box sx={{ textAlign: "center", marginTop: "16px" }}>
                            <SubHeading sx={{
                              color: "#4a5568",
                              fontSize: "15px",
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              Already have an account?{" "}
                              <Link
                                to="/login"
                                style={{
                                  fontWeight: "600",
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  backgroundClip: "text",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  textDecoration: "none",
                                  fontFamily: "'Poppins', sans-serif"
                                }}
                              >
                                Login
                              </Link>
                            </SubHeading>
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
                              {isLoading ? "Signing up..." : "Sign Up"}
                            </Button>
                          </Box>
                        </Form>
                      );
                    }}
                  </Formik>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box >
      <ToastAlert
        appearence={toast.appearence}
        type={toast.type}
        message={toast.message}
        handleClose={handleCloseToast}
      />
    </>
  );
};

export default Signup;
