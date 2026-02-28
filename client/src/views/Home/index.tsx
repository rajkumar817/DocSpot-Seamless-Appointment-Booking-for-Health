import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaStethoscope, FaCalendarCheck, FaUserMd, FaShieldAlt } from "react-icons/fa";
import BackgroundImage from "../../assets/images/docappbg.jpg";
import Footer from "../../components/Footer";

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: FaCalendarCheck,
            title: "Easy Appointment Booking",
            description: "Schedule appointments with your preferred doctors in just a few clicks",
        },
        {
            icon: FaUserMd,
            title: "Qualified Doctors",
            description: "Access a network of experienced and certified medical professionals",
        },
        {
            icon: FaStethoscope,
            title: "Comprehensive Care",
            description: "Get complete healthcare services tailored to your needs",
        },
        {
            icon: FaShieldAlt,
            title: "Secure & Private",
            description: "Your medical information is protected with industry-standard security",
        },
    ];

    return (
        <>
            <Box
                sx={{
                    minHeight: "100vh",
                    backgroundImage: `linear-gradient(rgba(102, 126, 234, 0.85), rgba(118, 75, 162, 0.85)), url(${BackgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: { xs: "scroll", md: "fixed" },
                    display: "flex",
                    alignItems: "center",
                    padding: { xs: "20px 0", sm: "30px 0", md: "40px 0" },
                }}
            >
                <Container
                    maxWidth="lg"
                    sx={{
                        px: { xs: 2, sm: 3, md: 4 },
                    }}
                >
                    {/* Hero Section */}
                    <Box
                        sx={{
                            textAlign: "center",
                            marginBottom: { xs: "40px", sm: "50px", md: "60px" },
                            animation: "fadeInDown 1s ease-in-out",
                            "@keyframes fadeInDown": {
                                from: {
                                    opacity: 0,
                                    transform: "translateY(-30px)",
                                },
                                to: {
                                    opacity: 1,
                                    transform: "translateY(0)",
                                },
                            },
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 700,
                                fontSize: { xs: "28px", sm: "40px", md: "50px", lg: "56px" },
                                color: "#fff",
                                marginBottom: { xs: "15px", md: "20px" },
                                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                                lineHeight: 1.2,
                                px: { xs: 1, sm: 2 },
                            }}
                        >
                            Welcome to HealthCare Clinic
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 400,
                                fontSize: { xs: "14px", sm: "18px", md: "20px", lg: "24px" },
                                color: "rgba(255, 255, 255, 0.95)",
                                marginBottom: { xs: "25px", md: "30px" },
                                maxWidth: "800px",
                                margin: { xs: "0 auto 25px", md: "0 auto 30px" },
                                lineHeight: 1.6,
                                px: { xs: 2, sm: 3 },
                            }}
                        >
                            Your trusted partner in healthcare management. Book appointments with qualified doctors,
                            manage your medical records, and receive quality care—all in one place.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/login")}
                            sx={{
                                background: "#fff",
                                color: "#667eea",
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 600,
                                fontSize: { xs: "14px", sm: "16px", md: "18px" },
                                padding: { xs: "12px 30px", sm: "14px 40px", md: "15px 50px" },
                                borderRadius: "50px",
                                textTransform: "none",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "#f0f0f0",
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                                },
                            }}
                        >
                            Click Here to Login
                        </Button>
                    </Box>

                    {/* Features Section */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                            gap: { xs: 2, sm: 3, md: 4 },
                            marginTop: { xs: "40px", sm: "50px", md: "60px" },
                        }}
                    >
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                sx={{
                                    background: "rgba(255, 255, 255, 0.15)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: { xs: "15px", md: "20px" },
                                    padding: { xs: "20px", sm: "25px", md: "30px" },
                                    border: "2px solid rgba(255, 255, 255, 0.2)",
                                    transition: "all 0.3s ease",
                                    animation: `fadeInUp ${0.5 + index * 0.2}s ease-in-out`,
                                    "@keyframes fadeInUp": {
                                        from: {
                                            opacity: 0,
                                            transform: "translateY(30px)",
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: "translateY(0)",
                                        },
                                    },
                                    "&:hover": {
                                        background: "rgba(255, 255, 255, 0.25)",
                                        transform: { xs: "none", md: "translateY(-5px)" },
                                        boxShadow: { xs: "none", md: "0 10px 30px rgba(0,0,0,0.3)" },
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: { xs: "50px", md: "60px" },
                                        height: { xs: "50px", md: "60px" },
                                        borderRadius: "50%",
                                        background: "rgba(255, 255, 255, 0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: { xs: "15px", md: "20px" },
                                    }}
                                >
                                    <feature.icon style={{ fontSize: window.innerWidth < 600 ? "24px" : "30px", color: "#fff" }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: 600,
                                        fontSize: { xs: "18px", sm: "20px", md: "22px" },
                                        color: "#fff",
                                        marginBottom: { xs: "8px", md: "10px" },
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "14px", sm: "15px", md: "16px" },
                                        color: "rgba(255, 255, 255, 0.9)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {feature.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Additional Info Section */}
                    <Box
                        sx={{
                            marginTop: { xs: "40px", sm: "50px", md: "60px" },
                            marginBottom: { xs: "20px", sm: "30px", md: "0" },
                            textAlign: "center",
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: { xs: "15px", md: "20px" },
                            padding: { xs: "25px 20px", sm: "35px 25px", md: "40px" },
                            border: "2px solid rgba(255, 255, 255, 0.2)",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 600,
                                fontSize: { xs: "20px", sm: "26px", md: "32px" },
                                color: "#fff",
                                marginBottom: { xs: "15px", md: "20px" },
                            }}
                        >
                            Why Choose Us?
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: { xs: "14px", sm: "16px", md: "18px" },
                                color: "rgba(255, 255, 255, 0.95)",
                                lineHeight: 1.8,
                                maxWidth: "900px",
                                margin: "0 auto",
                                px: { xs: 1, sm: 2 },
                            }}
                        >
                            Our platform streamlines the entire healthcare experience, from booking appointments to
                            managing medical records. With a user-friendly interface and robust security measures,
                            we ensure that your healthcare journey is smooth, efficient, and secure. Join thousands
                            of satisfied patients who trust us with their healthcare needs.
                        </Typography>
                    </Box>
                </Container>
            </Box>
            <Footer backgroundColor="#fff" textColor="#000" />
        </>
    );
};

export default Home;
