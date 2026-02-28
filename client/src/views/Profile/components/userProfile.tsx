// React Imports
import { useState, useEffect } from "react";
// Hooks
import useTypedSelector from "../../../hooks/useTypedSelector";
// Formik
import { Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
// Redux
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "../../../redux/api/userSlice";
import {
  selectedUserId,
  userIsAdmin,
  userIsDoctor,
} from "../../../redux/auth/authSlice";
// Utils
import { onKeyDown } from "../../../utils";
// MUI Imports
import { Box, Button, Grid } from "@mui/material";
// Custom Imports
import OverlayLoader from "../../../components/Spinner/OverlayLoader";
import Navbar from "../../../components/Navbar";
import { Heading, SubHeading } from "../../../components/Heading";
import ToastAlert from "../../../components/ToastAlert/ToastAlert";
import PrimaryInput from "../../../components/PrimaryInput/PrimaryInput";
import PrimaryPhoneInput from "../../../components/PhoneInput";

interface UserProfileForm {
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  dateOfBirth: string;
  bloodGroup: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Please provide a valid email"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/, "Please provide a valid phone number"),
  gender: Yup.string().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  dateOfBirth: Yup.string().required("Date of Birth is required"),
  bloodGroup: Yup.string().required("Blood Group is required"),
});

const UserProfile = () => {
  const userId = useTypedSelector(selectedUserId);
  const isDoctor = useTypedSelector(userIsDoctor);
  const isAdmin = useTypedSelector(userIsAdmin);

  const [formValues, setFormValues] = useState<UserProfileForm>({
    name: "",
    email: "",
    phoneNumber: "",
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

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const { data, isLoading, isSuccess, refetch } = useGetUserQuery({
    userId,
  });

  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (isSuccess && data?.data) {
      setFormValues({
        name: data.data.name || "",
        email: data.data.email || "",
        phoneNumber: data.data.phoneNumber || "",
        gender: data.data.gender || "",
        address: data.data.address || "",
        dateOfBirth: data.data.dateOfBirth ? new Date(data.data.dateOfBirth).toISOString().split('T')[0] : "",
        bloodGroup: data.data.bloodGroup || "",
      });
    }
  }, [data, isSuccess]);

  const handleSubmit = async (values: UserProfileForm) => {
    try {
      const response: any = await updateUser({
        userId,
        body: {
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          address: values.address,
          dateOfBirth: values.dateOfBirth,
          bloodGroup: values.bloodGroup,
        },
      });

      if (response?.data?.status === "success") {
        refetch();
        setToast({
          message: "Profile updated successfully",
          appearence: true,
          type: "success",
        });
      }

      if (response?.error) {
        setToast({
          message: response?.error?.data?.message || "Failed to update profile",
          appearence: true,
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  return (
    <>
      {isLoading && <OverlayLoader />}
      <Navbar>
        <Box sx={{ minHeight: "100vh", padding: "20px" }}>
          <Heading sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "20px" }}>{isDoctor ? "Doctor" : isAdmin ? "Admin" : "User"} Profile</Heading>
          <Box
            sx={{
              margin: "20px 0",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              padding: { xs: "20px", md: "30px" },
              boxShadow: "0 8px 32px 0 rgba(102, 126, 234, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              maxWidth: "900px",
            }}
          >
            <SubHeading
              sx={{
                marginBottom: "25px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  background: "rgba(255, 255, 255, 0.25)",
                  backdropFilter: "blur(10px)",
                  fontSize: "13px",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontWeight: "600",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {isDoctor ? "🩺 Doctor" : isAdmin ? "👨‍💼 Admin" : "👤 User"}
              </Box>
              Personal Information
            </SubHeading>

            <Formik
              initialValues={formValues}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
              enableReinitialize
            >
              {(props: FormikProps<UserProfileForm>) => {
                const {
                  values,
                  touched,
                  errors,
                  handleBlur,
                  handleChange,
                } = props;

                return (
                  <Form onKeyDown={onKeyDown}>
                    <Grid container rowSpacing={2} columnSpacing={4}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Full Name
                          </SubHeading>
                          <PrimaryInput
                            type="text"
                            label=""
                            name="name"
                            placeholder="Enter your full name"
                            value={values.name}
                            helperText={
                              errors.name && touched.name ? errors.name : ""
                            }
                            error={errors.name && touched.name ? true : false}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Email Address
                          </SubHeading>
                          <PrimaryInput
                            type="email"
                            label=""
                            name="email"
                            placeholder="Enter your email"
                            value={values.email}
                            helperText={
                              errors.email && touched.email ? errors.email : ""
                            }
                            error={errors.email && touched.email ? true : false}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Phone Number
                          </SubHeading>
                          <PrimaryPhoneInput
                            value={values.phoneNumber}
                            name="phoneNumber"
                            formik={props}
                            variant="outlined"
                            label=""
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Gender
                          </SubHeading>
                          <PrimaryInput
                            type="text"
                            label=""
                            name="gender"
                            placeholder="Male / Female / Other"
                            value={values.gender}
                            helperText={errors.gender && touched.gender ? errors.gender : ""}
                            error={errors.gender && touched.gender ? true : false}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Address
                          </SubHeading>
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
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Date of Birth
                          </SubHeading>
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
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ marginBottom: "10px" }}>
                          <SubHeading sx={{ marginBottom: "5px" }}>
                            Blood Group
                          </SubHeading>
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
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        marginTop: "20px",
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updateLoading}
                        sx={{
                          padding: "12px 40px",
                          textTransform: "capitalize",
                          margin: "20px 0",
                          fontSize: "16px",
                          fontWeight: 600,
                          fontFamily: "'Poppins', sans-serif",
                          background: updateLoading
                            ? "rgba(255, 255, 255, 0.7)"
                            : "#fff",
                          color: updateLoading ? "#999" : "#667eea",
                          borderRadius: "12px",
                          boxShadow: updateLoading
                            ? "none"
                            : "0 4px 15px 0 rgba(255, 255, 255, 0.3)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: updateLoading
                              ? "rgba(255, 255, 255, 0.7)"
                              : "rgba(255, 255, 255, 0.95)",
                            boxShadow: updateLoading
                              ? "none"
                              : "0 6px 20px 0 rgba(255, 255, 255, 0.4)",
                            transform: updateLoading ? "none" : "translateY(-2px)",
                          },
                          "&:active": {
                            transform: updateLoading ? "none" : "translateY(0)",
                          },
                          "&.Mui-disabled": {
                            color: "#999",
                            opacity: 0.7,
                          },
                        }}
                      >
                        {updateLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          </Box>
        </Box>
      </Navbar>

      <ToastAlert
        appearence={toast.appearence}
        type={toast.type}
        message={toast.message}
        handleClose={handleCloseToast}
      />
    </>
  );
};

export default UserProfile;
