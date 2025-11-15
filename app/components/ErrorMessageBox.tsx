import React from "react";

interface ErrorMessageBoxProps {
  message: string | null; // สามารถเป็น string หรือ null ก็ได้
  onClose: () => void;
}

const ErrorMessageBox: React.FC<ErrorMessageBoxProps> = ({
  message,
  onClose,
}) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#e74c3c", // สีแดงสำหรับ Error
        color: "white",
        padding: "15px 25px",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "15px",
        fontSize: "16px",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "20px",
          cursor: "pointer",
          marginLeft: "10px",
        }}
      >
        &times; {/* สัญลักษณ์กากบาทปิด */}
      </button>
    </div>
  );
};

export default ErrorMessageBox;
