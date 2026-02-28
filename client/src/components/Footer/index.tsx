import { Box, Container, Grid, Typography, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import useTypedSelector from "../../hooks/useTypedSelector";
import { selectedUserId, userIsDoctor } from "../../redux/auth/authSlice";

interface FooterProps {
    backgroundColor?: string;
    textColor?: string;
}

const Footer = ({ backgroundColor = "#000", textColor = "#fff" }: FooterProps) => {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();
    const userId = useTypedSelector(selectedUserId);
    const isDoctor = useTypedSelector(userIsDoctor);

    const linkStyle = {
        color: textColor === "#fff" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
            color: textColor === "#fff" ? "#fff" : "#000",
            paddingLeft: "5px",
        },
    };

    return (
        <Box
            component="footer"
            sx={{
                background: backgroundColor,
                color: textColor,
                padding: "40px 0 20px 0",
                marginTop: "auto",
                boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* About Section */}
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 600,
                                marginBottom: 2,
                                fontSize: "18px",
                            }}
                        >
                            About Us
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "16px",
                                fontWeight: 600,
                                lineHeight: 1.8,
                                color: textColor === "#fff" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                            }}
                        >
                            We provide comprehensive healthcare services with a team of experienced doctors
                            dedicated to your well-being. Book appointments easily and manage your health
                            journey with us.
                        </Typography>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 600,
                                marginBottom: 2,
                                fontSize: "18px",
                            }}
                        >
                            Quick Links
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Box
                                onClick={() => navigate("/dashboard")}
                                sx={linkStyle}
                            >
                                Home
                            </Box>
                            <Box
                                onClick={() => navigate(isDoctor ? "/doctors/appointments" : "/appointments")}
                                sx={linkStyle}
                            >
                                Appointments
                            </Box>
                            <Box
                                onClick={() => navigate(`/profile/${userId}`)}
                                sx={linkStyle}
                            >
                                Profile
                            </Box>
                            <Box
                                onClick={() => navigate("/notifications")}
                                sx={linkStyle}
                            >
                                Notifications
                            </Box>
                        </Box>
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 600,
                                marginBottom: 2,
                                fontSize: "18px",
                            }}
                        >
                            Contact Us
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <MdEmail style={{ fontSize: "18px", color: textColor }} />
                                <Typography
                                    sx={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "14px",
                                        color: textColor === "#fff" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                                    }}
                                >
                                    farhaninfo@healthcare.com
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <MdPhone style={{ fontSize: "18px", color: textColor }} />
                                <Typography
                                    sx={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "14px",
                                        color: textColor === "#fff" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                                    }}
                                >
                                    +918919439778
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <MdLocationOn style={{ fontSize: "18px", color: textColor }} />
                                <Typography
                                    sx={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "14px",
                                        color: textColor === "#fff" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                                    }}
                                >
                                    Brundhavan towers |Hitech City ,
                                    Hyderabad |
                                    5000271
                                </Typography>
                            </Box>
                        </Box>

                        {/* Social Media Icons */}
                        <Box sx={{ display: "flex", gap: 2, marginTop: 3 }}>
                            <Box
                                sx={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: textColor === "#fff" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: textColor === "#fff" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                <FaFacebookF style={{ fontSize: "16px", color: textColor }} />
                            </Box>
                            <Box
                                sx={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: textColor === "#fff" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: textColor === "#fff" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                <FaTwitter style={{ fontSize: "16px", color: textColor }} />
                            </Box>
                            <Box
                                sx={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: textColor === "#fff" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: textColor === "#fff" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                <FaLinkedinIn style={{ fontSize: "16px", color: textColor }} />
                            </Box>
                            <Box
                                sx={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: textColor === "#fff" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: textColor === "#fff" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                <FaInstagram style={{ fontSize: "16px", color: textColor }} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: textColor === "#fff" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)", margin: "30px 0 20px 0" }} />

                {/* Copyright */}
                <Box sx={{ textAlign: "center" }}>
                    <Typography
                        sx={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "14px",
                            color: textColor === "#fff" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.6)",
                        }}
                    >
                        © {currentYear} Healthcare Clinic. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
