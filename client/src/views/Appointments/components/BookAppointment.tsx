// React Imports
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Redux
import {
  useBookedAppointmentsQuery,
  useCheckBookingAvailabilityMutation,
  useGetDoctorQuery,
} from "../../../redux/api/doctorSlice";
// Utils
import {
  add30Minutes,
  convertToAMPMFormat,
  formatDate,
  formatTime,
  onKeyDown,
  thousandSeparatorNumber,
} from "../../../utils";
// React Icons
import { RiLuggageDepositLine } from "react-icons/ri";
import { MdOutlineExplicit } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { CiMoneyCheck1 } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
// Formik
import { Form, Formik, FormikProps } from "formik";
// Yup
import * as Yup from "yup";
// MUI Imports
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box, Grid, Divider, Button, TextField } from "@mui/material";
// Custom Imports
import DatePicker from "../../../components/DatePicker";
import Navbar from "../../../components/Navbar";
import { Heading, SubHeading } from "../../../components/Heading";
import OverlayLoader from "../../../components/Spinner/OverlayLoader";
import useTypedSelector from "../../../hooks/useTypedSelector";
import { selectedUserId, userIsDoctor } from "../../../redux/auth/authSlice";
import {
  useBookAppointmentMutation,
  useGetUserQuery,
} from "../../../redux/api/userSlice";
import ToastAlert from "../../../components/ToastAlert/ToastAlert";
import DocumentUpload from "../../../components/DocumentUpload";

const AppointmentSchema = Yup.object().shape({
  date: Yup.string().required("Date is required"),
  time: Yup.string().required("Time is required"),
});

interface AppointmentForm {
  date: string | null;
  time: string | null;
}

interface UploadedDocument {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
}

const BookAppointment = () => {
  const navigate = useNavigate();
  // Doctor Id  ===> userId
  const { userId } = useParams();
  const loginUserId = useTypedSelector(selectedUserId);
  const isDoctor = useTypedSelector(userIsDoctor);
  const [isAvailable, setIsAvailable] = useState(false);
  const [appointment, setAppointment] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formValues, setFormValues] = useState<AppointmentForm>({
    date: null,
    time: null,
  });
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  // Doctor Get API
  const { data, isLoading } = useGetDoctorQuery({
    userId,
  });

  // User Get API
  const { data: logedInUserData, isLoading: logedInUserLoading } =
    useGetUserQuery({
      userId: loginUserId,
    });

  // Get Booked Slots API
  const { data: getAppointmentData, isLoading: getAppointmentLoading } =
    useBookedAppointmentsQuery({ userId });

  const [bookAppointment, { isLoading: appointmentLoading }] =
    useBookAppointmentMutation();

  const [checkBookingAvailability, { isLoading: checkBookingLoading }] =
    useCheckBookingAvailabilityMutation();

  // Redirect doctors away from booking page - they shouldn't book appointments
  useEffect(() => {
    if (isDoctor) {
      navigate("/doctors/appointments");
    }
  }, [isDoctor, navigate]);

  const appointmentHandler = async (appointmentData: AppointmentForm) => {
    if (appointment === "checkAvailability") {
      const payload = {
        doctorId: userId,
        date: appointmentData.date,
        time: appointmentData.time,
      };
      const doctorAvailability: any = await checkBookingAvailability(payload);

      if (doctorAvailability?.data?.status) {
        setIsAvailable(true);
        setToast({
          ...toast,
          message: doctorAvailability?.data?.message,
          appearence: true,
          type: "success",
        });
      }
      if (doctorAvailability?.error) {
        setToast({
          ...toast,
          message: doctorAvailability?.error?.data?.message,
          appearence: true,
          type: "error",
        });
      }

      try {
      } catch (error) {
        console.error("Check Booking Availability Error:", error);
        setToast({
          ...toast,
          message: "Something went wrong",
          appearence: true,
          type: "error",
        });
      }
    }

    if (appointment === "bookAppointment") {
      const payload = {
        doctorId: userId,
        userId: loginUserId,
        doctorInfo: data?.data,
        userInfo: logedInUserData?.data,
        date: appointmentData.date,
        time: appointmentData.time,
      };

      try {
        const userAppointment: any = await bookAppointment(payload);
        if (userAppointment?.data?.status) {
          // Upload documents if available
          if (documents.length > 0) {
            const appointmentId = userAppointment?.data?.data?._id;

            // Make API call to upload documents
            try {
              const response = await fetch(
                `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/v1/users/upload-documents`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({
                    appointmentId,
                    documents,
                  }),
                }
              );

              if (!response.ok) {
                console.error("Document upload failed");
              }
            } catch (docError) {
              console.error("Document upload error:", docError);
            }
          }

          setIsAvailable(false);
          setDocuments([]); // Clear documents after booking
          setToast({
            ...toast,
            message: userAppointment?.data?.message,
            appearence: true,
            type: "success",
          });
          setTimeout(() => {
            navigate(isDoctor ? "/doctors/appointments" : "/appointments");
          }, 1500);
        }
        if (userAppointment?.error) {
          setToast({
            ...toast,
            message: userAppointment?.error?.data?.message,
            appearence: true,
            type: "error",
          });
        }
      } catch (error) {
        console.error("Book Appointment Error:", error);
        setToast({
          ...toast,
          message: "Something went wrong",
          appearence: true,
          type: "error",
        });
      }
    }
  };

  return (
    <>
      {(isLoading || logedInUserLoading || getAppointmentLoading) && (
        <OverlayLoader />
      )}
      <Navbar>
        <Heading sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Book Appointments</Heading>
        <Box>
          <Grid container rowSpacing={3} columnSpacing={4}>
            <Grid item xs={4}>
              <Box
                sx={{
                  margin: "20px 0",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "20px",
                  padding: "24px 28px 8px 28px",
                  boxShadow: "0 8px 32px 0 rgba(102, 126, 234, 0.37)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 40px 0 rgba(102, 126, 234, 0.5)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Heading
                    sx={{
                      margin: "5px 0",
                      fontSize: "20px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    Timings
                  </Heading>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontFamily: "'Poppins', sans-serif",
                      color: "rgba(255, 255, 255, 0.95)",
                      fontSize: "15px",
                    }}
                  >
                    <IoMdTime style={{ fontSize: "20px" }} />
                    <Box>{`${convertToAMPMFormat(
                      data?.data?.fromTime
                    )} to ${convertToAMPMFormat(data?.data?.toTime)}`}</Box>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", margin: "12px 0" }} />
                <Box sx={{ marginTop: "16px" }}>
                  <Formik
                    initialValues={formValues}
                    onSubmit={(values: AppointmentForm) => {
                      appointmentHandler(values);
                    }}
                    validationSchema={AppointmentSchema}
                    enableReinitialize
                  >
                    {(props: FormikProps<AppointmentForm>) => {
                      const { values, touched, errors, setFieldValue } = props;

                      return (
                        <Form onKeyDown={onKeyDown}>
                          <Box sx={{ marginBottom: "16px" }}>
                            <SubHeading sx={{ marginBottom: "8px", color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: "500" }}>
                              Select Date
                            </SubHeading>
                            <DatePicker
                              label=""
                              minDate={new Date()}
                              value={values.date}
                              handleChange={(value: any) => {
                                setFieldValue("date", value);
                                setIsAvailable(false);
                              }}
                            />
                            {errors.date && touched.date && (
                              <Box
                                sx={{
                                  color: "#ffcccb",
                                  marginLeft: "2px",
                                  fontSize: "0.75rem",
                                  marginTop: "4px",
                                }}
                              >
                                {errors.date}
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ marginBottom: "16px" }}>
                            <SubHeading sx={{ marginBottom: "8px", color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: "500" }}>
                              Select Time
                            </SubHeading>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <TimePicker
                                label=""
                                value={values.time}
                                onChange={(value) => {
                                  setFieldValue("time", value);
                                  setIsAvailable(false);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    sx={{
                                      width: "100%",
                                      "& .MuiOutlinedInput-root": {
                                        background: "#fff",
                                        borderRadius: "8px",
                                      }
                                    }}
                                    {...params}
                                  />
                                )}
                              />
                              {errors.time && touched.time && (
                                <Box
                                  sx={{
                                    color: "#ffcccb",
                                    marginLeft: "2px",
                                    fontSize: "0.75rem",
                                    marginTop: "4px",
                                  }}
                                >
                                  {errors.time}
                                </Box>
                              )}
                            </LocalizationProvider>
                          </Box>
                          <DocumentUpload
                            documents={documents}
                            onDocumentsChange={setDocuments}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "end",
                              marginTop: "10px",
                            }}
                          >
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              disabled={checkBookingLoading}
                              sx={{
                                padding: "12px 30px",
                                textTransform: "capitalize",
                                margin: "20px 0",
                                background: "#fff",
                                color: "#667eea",
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: "600",
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
                              onClick={() => {
                                setAppointment("checkAvailability");
                              }}
                            >
                              {checkBookingLoading
                                ? "Checking Availability..."
                                : "Check Availability"}
                            </Button>
                          </Box>

                          {isAvailable && (
                            <Button
                              type="submit"
                              variant="contained"
                              fullWidth
                              disabled={appointmentLoading}
                              sx={{
                                padding: "12px 30px",
                                textTransform: "capitalize",
                                margin: "0px 0 20px 0",
                                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                                color: "#fff",
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: "600",
                                borderRadius: "12px",
                                boxShadow: "0 4px 15px 0 rgba(56, 239, 125, 0.3)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #38ef7d 0%, #11998e 100%)",
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 6px 20px 0 rgba(56, 239, 125, 0.4)",
                                },
                                "&:disabled": {
                                  background: "rgba(56, 239, 125, 0.5)",
                                },
                              }}
                              onClick={() => {
                                setAppointment("bookAppointment");
                              }}
                            >
                              {appointmentLoading
                                ? "Booking..."
                                : "Book Appointment"}
                            </Button>
                          )}
                        </Form>
                      );
                    }}
                  </Formik>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  margin: "20px 0",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  borderRadius: "20px",
                  padding: "24px 28px",
                  boxShadow: "0 8px 32px 0 rgba(240, 147, 251, 0.37)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 40px 0 rgba(240, 147, 251, 0.5)",
                  },
                }}
              >
                <Heading
                  sx={{
                    margin: "5px 0",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  {`${data?.data?.prefix} ${data?.data?.fullName}`}
                  <Box sx={{ fontSize: "15px", fontWeight: "400", color: "rgba(255, 255, 255, 0.9)" }}>
                    {`(${data?.data?.specialization})`}
                  </Box>
                </Heading>
                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", margin: "12px 0" }} />
                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <IoMdTime style={{ fontSize: "18px" }} />
                    Consultation Time
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>30 Minutes </Box>
                </Box>
                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <RiLuggageDepositLine style={{ fontSize: "18px" }} />
                    Department
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>{data?.data?.specialization}</Box>
                </Box>
                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <MdOutlineExplicit style={{ fontSize: "18px" }} />
                    Experience
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>{data?.data?.experience} Years </Box>
                </Box>

                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <CiMoneyCheck1 style={{ fontSize: "18px" }} />
                    Fee Per Visit
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>
                    {thousandSeparatorNumber(data?.data?.feePerConsultation)}
                  </Box>
                </Box>
                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <CiLocationOn style={{ fontSize: "18px" }} />
                    Location
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>{data?.data?.address}</Box>
                </Box>
                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <MdOutlineExplicit style={{ fontSize: "18px" }} />
                    Languages
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>{data?.data?.languages}</Box>
                </Box>
                <Box
                  sx={{
                    margin: "15px 0 10px 0",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "500",
                      color: "#fff",
                    }}
                  >
                    <RiLuggageDepositLine style={{ fontSize: "18px" }} />
                    Bio
                  </Box>
                  <Box sx={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255, 255, 255, 0.95)" }}>{data?.data?.bio}</Box>
                </Box>
              </Box>
            </Grid>
            {getAppointmentData?.data?.length > 0 && (
              <Grid item xs={4}>
                <Box
                  sx={{
                    margin: "20px 0",
                    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    borderRadius: "20px",
                    padding: "24px 28px",
                    boxShadow: "0 8px 32px 0 rgba(250, 112, 154, 0.37)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 40px 0 rgba(250, 112, 154, 0.5)",
                    },
                  }}
                >
                  <Heading
                    sx={{
                      margin: "5px 0",
                      fontSize: "20px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    Booked Appointments Details
                  </Heading>
                  <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", margin: "12px 0" }} />
                  {getAppointmentData?.data?.map((item: any, index: number) => (
                    <Box
                      key={item?._id || index}
                      sx={{
                        margin: "15px 0 10px 0",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: "150px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "500",
                          color: "#fff",
                        }}
                      >
                        {formatDate(item?.date)}
                      </Box>
                      <Box
                        sx={{
                          background: "rgba(255, 255, 255, 0.25)",
                          backdropFilter: "blur(10px)",
                          color: "#fff",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "150px",
                          fontSize: "13px",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "500",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        {`${formatTime(item?.time)} to ${formatTime(
                          add30Minutes(item?.time)
                        )}`}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
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

export default BookAppointment;
