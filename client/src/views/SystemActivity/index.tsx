import { useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Card,
    Typography,
} from "@mui/material";
import { Heading } from "../../components/Heading";
import Navbar from "../../components/Navbar";
import { useGetSystemActivityQuery } from "../../redux/api/adminApiSlice";
import OverlayLoader from "../../components/Spinner/OverlayLoader";
import moment from "moment";

const SystemActivity = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { data, isLoading } = useGetSystemActivityQuery({
        page: page + 1,
        limit: rowsPerPage,
    });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <>
            {isLoading && <OverlayLoader />}
            <Navbar>
                <Heading>System Activity Log</Heading>
                <Card
                    sx={{
                        mt: 4,
                        boxShadow: "0 8px 32px 0 rgba(77, 91, 158, 0.15)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "#fff",
                    }}
                >
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }} aria-label="system activity table">
                            <TableHead sx={{ background: "#f8f9fa" }}>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            color: "#6c757d",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    >
                                        Date & Time
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            color: "#6c757d",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    >
                                        User
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            color: "#6c757d",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    >
                                        Role
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            color: "#6c757d",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    >
                                        Action
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            color: "#6c757d",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    >
                                        Details
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Box sx={{ py: 3, color: "#999" }}>
                                                No activity logs found
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((row: any) => (
                                        <TableRow
                                            key={row._id}
                                            sx={{
                                                "&:last-child td, &:last-child th": { border: 0 },
                                                "&:hover": { backgroundColor: "#f8f9fa" },
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <TableCell
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    color: "#2d3436",
                                                }}
                                            >
                                                {moment(row.createdAt).format("MMM DD, YYYY hh:mm A")}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontWeight: 500,
                                                    color: "#667eea",
                                                }}
                                            >
                                                {row.user?.name || "Unknown"}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: "'Poppins', sans-serif" }}>
                                                {/* Determine role based on user object if available, though role field in user might differ */}
                                                {row.user?.role ||
                                                    (row.user?.isAdmin
                                                        ? "Admin"
                                                        : row.user?.isDoctor
                                                            ? "Doctor"
                                                            : "User")}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontWeight: 600,
                                                    color: "#2d3436",
                                                }}
                                            >
                                                {row.action}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    color: "#636e72",
                                                    maxWidth: "300px",
                                                }}
                                            >
                                                {row.details}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={data?.total || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                            {
                                fontFamily: "'Poppins', sans-serif",
                            },
                        }}
                    />
                </Card>
            </Navbar>
        </>
    );
};

export default SystemActivity;
