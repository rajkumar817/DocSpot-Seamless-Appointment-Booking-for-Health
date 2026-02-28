import { useState } from "react";
import { Box, Button, Typography, List, ListItem } from "@mui/material";
import { MdClose, MdUploadFile } from "react-icons/md";

interface UploadedDocument {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  uploadedAt?: string;
}

interface DocumentUploadProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
}

const DocumentUpload = ({
  documents,
  onDocumentsChange,
}: DocumentUploadProps) => {
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError("");
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds maximum size of 5MB`);
        return;
      }

      // Validate file type (PDF, Images, Word, Excel)
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          `File type ${file.type} is not supported. Supported types: PDF, Images (JPG, PNG), Word, Excel`
        );
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        const base64Data = fileData.split(",")[1];

        const newDocument: UploadedDocument = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: base64Data,
        };

        // Check if document already exists
        const isDuplicate = documents.some(
          (doc) => doc.fileName === newDocument.fileName
        );

        if (!isDuplicate) {
          onDocumentsChange([...documents, newDocument]);
          setError("");
        } else {
          setError(`File ${file.name} is already uploaded`);
        }
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleRemoveDocument = (fileName: string) => {
    const updatedDocuments = documents.filter((doc) => doc.fileName !== fileName);
    onDocumentsChange(updatedDocuments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Box sx={{ marginBottom: "10px" }}>
      <Typography
        sx={{
          marginBottom: "8px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#333",
        }}
      >
        Upload Documents (Medical Records, Insurance)
      </Typography>

      {/* File Input */}
      <Box
        sx={{
          border: "2px dashed #4caf50",
          borderRadius: "4px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: "rgba(76, 175, 80, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            borderColor: "#45a049",
          },
          marginBottom: "12px",
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          id="document-upload"
          style={{ display: "none" }}
        />
        <label
          htmlFor="document-upload"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            gap: "8px",
          }}
        >
          <MdUploadFile style={{ fontSize: "28px", color: "#4caf50" }} />
          <Typography sx={{ fontSize: "13px", color: "#fff" }}>
            Click or drag files to upload (Max 5MB per file)
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.7)" }}>
            Supported: PDF, Images (JPG, PNG), Word, Excel
          </Typography>
        </label>
      </Box>

      {/* Error Message */}
      {error && (
        <Box
          sx={{
            color: "#d32f2f",
            fontSize: "12px",
            marginBottom: "8px",
            padding: "8px",
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            borderRadius: "4px",
          }}
        >
          {error}
        </Box>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <Box>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "8px",
              color: "#333",
            }}
          >
            Uploaded Documents ({documents.length})
          </Typography>
          <List
            sx={{
              padding: "0",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            {documents.map((doc, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderBottom:
                    index < documents.length - 1 ? "1px solid #e0e0e0" : "none",
                  backgroundColor: "#fff",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#333",
                    }}
                  >
                    {doc.fileName}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#999",
                      marginTop: "2px",
                    }}
                  >
                    {formatFileSize(doc.fileSize)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleRemoveDocument(doc.fileName)}
                  sx={{
                    minWidth: "auto",
                    padding: "4px 8px",
                    color: "#d32f2f",
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                    },
                  }}
                >
                  <MdClose />
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
