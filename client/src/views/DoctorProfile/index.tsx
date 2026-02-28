// React Imports
import { useParams, useNavigate } from "react-router-dom";
// MUI Imports
import { Box, Card, CardContent, Button, Divider, Grid, Chip } from "@mui/material";
// Icons
import { IoArrowBack, IoMedkitOutline, IoTimeOutline, IoLocationOutline, IoCallOutline, IoLanguageOutline } from "react-icons/io5";
import { FaUserMd } from "react-icons/fa";
// Custom Imports
import Navbar from "../../components/Navbar";
import { Heading, SubHeading } from "../../components/Heading";
import { useGetDoctorQuery } from "../../redux/api/doctorSlice";
import { convertToAMPMFormat, maskingPhoneNumber } from "../../utils";
import OverlayLoader from "../../components/Spinner/OverlayLoader";

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Reusing the getDoctor query - assumes the endpoint supports getting by ID or we need to filter
    // The current getDoctor query in doctorSlice seem to use `userId` which is what we need.
    const { data: doctorData, isLoading } = useGetDoctorQuery({ userId: id });

    // We need to access doctor info. The API response structure for `getDoctor` seems to return { status: true, message: "...", data: {...} }
    const doctor = doctorData?.data;

    // Helper for thousand separator since it was not exported or I missed it
    const thousandSeparatorNumber = (num: string | number) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <>
            {isLoading && <OverlayLoader />}
            <Navbar>
                <Box sx={{ padding: { xs: "20px", md: "40px" }, minHeight: "100vh" }}>
                    <Button
                        startIcon={<IoArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{
                            marginBottom: "20px",
                            color: "#fff",
                            textTransform: "none",
                            fontSize: "16px",
                            "&:hover": { background: "rgba(255,255,255,0.1)" }
                        }}
                    >
                        Back to Dashboard
                    </Button>

                    {doctor && (
                        <Card
                            sx={{
                                borderRadius: "24px",
                                background: "rgba(255, 255, 255, 0.95)",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                overflow: "visible"
                            }}
                        >
                            <Box
                                sx={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    padding: "40px",
                                    borderRadius: "24px 24px 0 0",
                                    color: "#fff",
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    alignItems: "center",
                                    gap: 3
                                }}
                            >
                                <Box
                                    sx={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.2)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: "50px",
                                        border: "4px solid rgba(255,255,255,0.3)"
                                    }}
                                >
                                    <FaUserMd />
                                </Box>
                                <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                                    <Heading sx={{ color: "#fff", fontSize: "32px", marginBottom: "8px" }}>{`${doctor.prefix} ${doctor.fullName}`}</Heading>
                                    <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "center", md: "flex-start" }, flexWrap: "wrap" }}>
                                        <Chip label={doctor.specialization} sx={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600 }} />
                                        <Chip label={`${doctor.experience} Years Experience`} sx={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600 }} />
                                    </Box>
                                </Box>
                                <Box sx={{ marginLeft: { md: "auto" } }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate(`/book-appointments/${doctor.userId}`)}
                                        sx={{
                                            background: "#fff",
                                            color: "#667eea",
                                            fontWeight: "bold",
                                            borderRadius: "12px",
                                            padding: "12px 30px",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                            "&:hover": {
                                                background: "#f0f0f0",
                                                transform: "translateY(-2px)"
                                            }
                                        }}
                                    >
                                        Book Appointment
                                    </Button>
                                </Box>
                            </Box>

                            <CardContent sx={{ padding: { xs: "20px", md: "40px" } }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={8}>
                                        <Box sx={{ marginBottom: "30px" }}>
                                            <SubHeading sx={{ fontSize: "20px", fontWeight: 700, color: "#2d3748", marginBottom: "15px", display: "flex", alignItems: "center", gap: 1 }}>
                                                About Doctor
                                            </SubHeading>
                                            <Box sx={{ color: "#4a5568", lineHeight: 1.8, fontSize: "16px" }}>
                                                {doctor.bio || "No bio available."}
                                            </Box>
                                        </Box>

                                        <Divider sx={{ margin: "30px 0" }} />

                                        <Box sx={{ marginBottom: "30px" }}>
                                            <SubHeading sx={{ fontSize: "20px", fontWeight: 700, color: "#2d3748", marginBottom: "15px" }}>
                                                Specialization & Services
                                            </SubHeading>
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: "#edf2f7", padding: "10px 20px", borderRadius: "10px", color: "#4a5568" }}>
                                                    <IoMedkitOutline /> {doctor.specialization}
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ margin: "30px 0" }} />

                                        <Box>
                                            <SubHeading sx={{ fontSize: "20px", fontWeight: 700, color: "#2d3748", marginBottom: "15px" }}>
                                                Languages Spoken
                                            </SubHeading>
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                {doctor.languages?.split(',').map((lang: string, idx: number) => (
                                                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, background: "#edf2f7", padding: "10px 20px", borderRadius: "10px", color: "#4a5568" }}>
                                                        <IoLanguageOutline /> {lang.trim()}
                                                    </Box>
                                                )) || "English"}
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ background: "#f7fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                                            <SubHeading sx={{ fontSize: "18px", fontWeight: 700, color: "#2d3748", marginBottom: "20px" }}>
                                                Contact & Availability
                                            </SubHeading>

                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, marginBottom: "20px" }}>
                                                <Box sx={{ color: "#667eea", fontSize: "20px", marginTop: "3px" }}><IoTimeOutline /></Box>
                                                <Box>
                                                    <Box sx={{ fontWeight: 600, color: "#2d3748" }}>Working Hours</Box>
                                                    <Box sx={{ color: "#718096", fontSize: "14px" }}>
                                                        {convertToAMPMFormat(doctor.fromTime)} - {convertToAMPMFormat(doctor.toTime)}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, marginBottom: "20px" }}>
                                                <Box sx={{ color: "#667eea", fontSize: "20px", marginTop: "3px" }}><IoLocationOutline /></Box>
                                                <Box>
                                                    <Box sx={{ fontWeight: 600, color: "#2d3748" }}>Location</Box>
                                                    <Box sx={{ color: "#718096", fontSize: "14px" }}>{doctor.address}</Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, marginBottom: "20px" }}>
                                                <Box sx={{ color: "#667eea", fontSize: "20px", marginTop: "3px" }}><IoCallOutline /></Box>
                                                <Box>
                                                    <Box sx={{ fontWeight: 600, color: "#2d3748" }}>Phone</Box>
                                                    <Box sx={{ color: "#718096", fontSize: "14px" }}>{maskingPhoneNumber(doctor.phoneNumber)}</Box>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ margin: "20px 0" }} />

                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                                <Box sx={{ color: "#4a5568" }}>Consultation Fee</Box>
                                                <Box sx={{ fontWeight: 700, fontSize: "18px", color: "#2d3748" }}>
                                                    {thousandSeparatorNumber(doctor.feePerConsultation)}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Navbar>
        </>
    );
};

export default DoctorProfile;
