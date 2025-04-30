import { Box } from "@mui/material";
import React from "react";

const CHIP_VARIANT_MAPPING = {
  default: {
    backgroundColor: "#e9ecef",
    color: "#000",
  },
  user: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  tag: {
    backgroundColor: "#6c757d",
    color: "#fff",
  },
  Low: {
    backgroundColor: "#28a745",
    color: "#fff",
  },
  High: {
    backgroundColor: "#dc3545",
    color: "#fff",
  },
  Medium: {
    backgroundColor: "#ffc107",
    color: "#212529",
  },
  info: {
    backgroundColor: "#17a2b8",
    color: "#fff",
  },
};

const Chip = ({ data, variant }) => {
  return (
    <Box
      sx={{
        ...CHIP_VARIANT_MAPPING[variant],
        padding: "0.2rem 0.5rem",
        borderRadius: 12,
      }}
    >
      {variant === "user" ? `@${data}` : data}
    </Box>
  );
};

export default Chip;
