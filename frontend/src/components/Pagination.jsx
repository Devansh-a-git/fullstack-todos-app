import { Box, Button, Typography } from "@mui/material";
import React from "react";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

const Pagination = ({
  currentPage,
  totalPages,
  handleNextPage,
  handlePreviousPage,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 1,
        boxShadow: 1,
        padding: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 2,
      }}
    >
      <Button
        variant="text"
        startIcon={<ChevronLeftIcon />}
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <Typography>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </Typography>
      <Button
        variant="text"
        endIcon={<ChevronRightIcon />}
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination;
