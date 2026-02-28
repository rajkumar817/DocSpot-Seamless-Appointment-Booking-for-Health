// React Imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// MUI Imports
import { Box, Button, Grid, Stack, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// Utils
import { onKeyDown } from "../../utils";
// Formik Imports
import { Form, Formik, FormikProps } from "formik";
// Hooks
import useTypedSelector from "../../hooks/useTypedSelector";
// Redux
import {
  selectedUserEmail,
  selectedUserId,
  selectedUserName,
  selectedUserPhoneNumber,
} from "../../redux/auth/authSlice";
import {
  useDoctorSignupMutation,
  useGetDoctorQuery,
} from "../../redux/api/doctorSlice";
// Custom Imports
import ToastAlert from "../../components/ToastAlert/ToastAlert";
import PrimaryPhoneInput from "../../components/PhoneInput";
import { Heading, SubHeading } from "../../components/Heading";
import Navbar from "../../components/Navbar";
import PrimaryInput from "../../components/PrimaryInput/PrimaryInput";
import OverlayLoader from "../../components/Spinner/OverlayLoader";
// Validation Schema
import { applyDoctorSchema } from "./components/validationSchema";

interface applyDoctorForm {
  prefix: string;
  fullName: string;
  phoneNumber: string;
  website: string;
  address: string;
  specialization: string;
  experience: string;
  feePerConsultation: string;
  fromTime: string | null;
  toTime: string | null;
  bio: string;
  languages: string;
}

const stepsStyle = {
  position: "absolute",
  background: "#5bc0de ",
  color: "#fff",
  left: "-40px",
  width: "35px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderTopLeftRadius: "10px",
  borderBottomRightRadius: "10px",
};

const ApplyDoctor = () => {
  const navigate = useNavigate();
  const userEmail = useTypedSelector(selectedUserEmail);
  const userId = useTypedSelector(selectedUserId);
  const userPhoneNumber = useTypedSelector(selectedUserPhoneNumber);
  const userName = useTypedSelector(selectedUserName);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formValues, setFormValues] = useState<applyDoctorForm>({
    prefix: "Dr.",
    fullName: userName,
    phoneNumber: userPhoneNumber,
    website: "",
    address: "",
    specialization: "",
    experience: "",
    feePerConsultation: "",
    fromTime: null,
    toTime: null,
    bio: "",
    languages: "",
  });

  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const [applyDoctor, { isLoading }] = useDoctorSignupMutation();

  const applyDoctorHandler = async (data: applyDoctorForm) => {
    try {
      const payload = {
        userId,
        prefix: data.prefix,
        fullName: data.fullName,
        email: userEmail,
        phoneNumber: data.phoneNumber,
        website: data.website,
        address: data.address,
        specialization: data.specialization,
        experience: data.experience,
        feePerConsultation: data.feePerConsultation,
        fromTime: data?.fromTime,
        toTime: data?.toTime,
        bio: data.bio,
        languages: data.languages,
      };

      const user: any = await applyDoctor(payload);

      if (user?.data?.status) {
        setToast({
          ...toast,
          message: "Doctor Account Applied Successfully",
          appearence: true,
          type: "success",
        });
        setTimeout(() => {
          navigate("/dashboard");
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
      console.error("Doctor Sign Up Error:", error);
      setToast({
        ...toast,
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  // Doctor Get API
  const { data, isLoading: doctorLoading } = useGetDoctorQuery({
    userId,
  });

  return (
    <>
      {doctorLoading && <OverlayLoader />}

      <Navbar>
        <Box>
          <Heading sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Apply For Doctor</Heading>
          {data?.data?.status ? (
            <Grid container rowSpacing={3} columnSpacing={4}>
              <Box
                sx={{
                  margin: "30px 0 20px 0",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "20px",
                  padding: "24px 32px",
                  boxShadow: "0 8px 32px 0 rgba(102, 126, 234, 0.37)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#fff",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                You already applied please wait for Admin Approval
              </Box>
            </Grid>
          ) : (
            <Box
              sx={{
                margin: "20px 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "20px",
                padding: "32px 36px",
                boxShadow: "0 8px 32px 0 rgba(102, 126, 234, 0.37)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <SubHeading
                sx={{
                  marginBottom: "24px",
                  fontSize: "18px",
                  position: "relative",
                  color: "#fff",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "600",
                }}
              >
                <Box sx={stepsStyle}>1</Box>
                Basic Information
              </SubHeading>
              <Box>
                <Formik
                  initialValues={formValues}
                  onSubmit={(values: applyDoctorForm) => {
                    applyDoctorHandler(values);
                  }}
                  validationSchema={applyDoctorSchema}
                >
                  {(props: FormikProps<applyDoctorForm>) => {
                    const {
                      values,
                      touched,
                      errors,
                      handleBlur,
                      handleChange,
                      setFieldValue,
                    } = props;

                    return (
                      <Form onKeyDown={onKeyDown}>
                        <Grid container rowSpacing={2} columnSpacing={4}>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Prefix
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="prefix"
                                placeholder="Prefix"
                                value={values.prefix}
                                readOnly={true}
                                helperText={
                                  errors.prefix && touched.prefix
                                    ? errors.prefix
                                    : ""
                                }
                                error={
                                  errors.prefix && touched.prefix ? true : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Full Name
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="fullName"
                                placeholder="Full Name"
                                value={values.fullName}
                                readOnly={true}
                                sx={{ cursor: "not-allowed" }}
                                helperText={
                                  errors.fullName && touched.fullName
                                    ? errors.fullName
                                    : ""
                                }
                                error={
                                  errors.fullName && touched.fullName
                                    ? true
                                    : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box
                              sx={{
                                marginBottom: "10px",
                              }}
                            >
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Mobile Number
                              </SubHeading>
                              <PrimaryPhoneInput
                                value={values.phoneNumber}
                                name="phoneNumber"
                                formik={props}
                                variant="outlined"
                                label=""
                                readOnly={true}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Website
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="website"
                                placeholder="Website"
                                value={values.website}
                                helperText={
                                  errors.website && touched.website
                                    ? errors.website
                                    : ""
                                }
                                error={
                                  errors.website && touched.website
                                    ? true
                                    : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Address
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="address"
                                placeholder="Address"
                                value={values.address}
                                helperText={
                                  errors.address && touched.address
                                    ? errors.address
                                    : ""
                                }
                                error={
                                  errors.address && touched.address
                                    ? true
                                    : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                        <SubHeading
                          sx={{
                            margin: "20px 0",
                            fontSize: "18px",
                            position: "relative",
                            color: "#fff",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "600",
                          }}
                        >
                          <Box sx={stepsStyle}>2</Box>
                          Professional Information
                        </SubHeading>

                        <Grid container rowSpacing={2} columnSpacing={4}>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Specialization
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="specialization"
                                placeholder="Specialization"
                                value={values.specialization}
                                helperText={
                                  errors.specialization &&
                                    touched.specialization
                                    ? errors.specialization
                                    : ""
                                }
                                error={
                                  errors.specialization &&
                                    touched.specialization
                                    ? true
                                    : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Experience
                              </SubHeading>
                              <PrimaryInput
                                type="number"
                                label=""
                                name="experience"
                                placeholder="Experience"
                                value={values.experience}
                                helperText={
                                  errors.experience && touched.experience
                                    ? errors.experience
                                    : ""
                                }
                                error={
                                  errors.experience && touched.experience
                                    ? true
                                    : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Fee Per Consultation
                              </SubHeading>
                              <PrimaryInput
                                type="number"
                                label=""
                                name="feePerConsultation"
                                placeholder="Fee Per Consultation"
                                value={values.feePerConsultation}
                                helperText={
                                  errors.feePerConsultation &&
                                    touched.feePerConsultation
                                    ? errors.feePerConsultation
                                    : ""
                                }
                                error={
                                  errors.feePerConsultation &&
                                    touched.feePerConsultation
                                    ? true
                                    : false
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Start Time
                              </SubHeading>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Stack spacing={3}>
                                  <TimePicker
                                    label=""
                                    value={values.fromTime}
                                    onChange={(value) => {
                                      setFieldValue("fromTime", value);
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            background: "#fff",
                                            borderRadius: "8px",
                                          }
                                        }}
                                        {...params}
                                      />
                                    )}
                                  />
                                </Stack>
                                {errors.fromTime && touched.fromTime && (
                                  <Box
                                    sx={{
                                      color: "#ffcccb",
                                      marginLeft: "2px",
                                      fontSize: "0.75rem",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {errors.fromTime}
                                  </Box>
                                )}
                              </LocalizationProvider>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                End Time
                              </SubHeading>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Stack spacing={3}>
                                  <TimePicker
                                    label=""
                                    value={values.toTime}
                                    onChange={(value) => {
                                      setFieldValue("toTime", value);
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            background: "#fff",
                                            borderRadius: "8px",
                                          }
                                        }}
                                        {...params}
                                      />
                                    )}
                                  />
                                </Stack>
                                {errors.toTime && touched.toTime && (
                                  <Box
                                    sx={{
                                      color: "#ffcccb",
                                      marginLeft: "2px",
                                      fontSize: "0.75rem",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {errors.toTime}
                                  </Box>
                                )}
                              </LocalizationProvider>
                            </Box>
                          </Grid>

                          <Grid item xs={12}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Bio
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="bio"
                                placeholder="Short bio about yourself"
                                value={values.bio}
                                multiline
                                minRows={3}
                                helperText={errors.bio && touched.bio ? errors.bio : ""}
                                error={errors.bio && touched.bio ? true : false}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ marginBottom: "10px" }}>
                              <SubHeading sx={{ marginBottom: "5px" }}>
                                Languages Spoken
                              </SubHeading>
                              <PrimaryInput
                                type="text"
                                label=""
                                name="languages"
                                placeholder="e.g. English, Spanish, Hindi"
                                value={values.languages}
                                helperText={errors.languages && touched.languages ? errors.languages : ""}
                                error={errors.languages && touched.languages ? true : false}
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
                            marginTop: "24px",
                          }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                              padding: "12px 40px",
                              textTransform: "capitalize",
                              margin: "20px 0",
                              background: "#fff",
                              color: "#667eea",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "600",
                              fontSize: "16px",
                              borderRadius: "12px",
                              boxShadow: "0 4px 15px 0 rgba(255, 255, 255, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "rgba(255, 255, 255, 0.95)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 20px 0 rgba(255, 255, 255, 0.4)",
                              },
                              "&:disabled": {
                                background: "rgba(255, 255, 255, 0.5)",
                                color: "rgba(102, 126, 234, 0.5)",
                              },
                            }}
                          >
                            {isLoading ? "Applying..." : "Submit Application"}
                          </Button>
                        </Box>
                      </Form>
                    );
                  }}
                </Formik>
              </Box>
            </Box>
          )}
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

export default ApplyDoctor;
