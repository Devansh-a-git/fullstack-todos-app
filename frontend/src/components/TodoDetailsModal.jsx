import React from "react";
import TodoBox from "./TodoBox";
import { DEATIL_VARIANT, MODAL_STYLES } from "../constants";
import { Box, CircularProgress, Modal } from "@mui/material";
import TodoDetailBox from "./TodoDetailBox";

const TodoDetailsModal = ({
  todoDetails,
  open,
  handleClose,
  loading,
  handleDelete,
  handleCheckboxChange,
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={MODAL_STYLES}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TodoDetailBox
            todo={todoDetails}
            variant={DEATIL_VARIANT}
            handleDelete={handleDelete}
            handleCheckboxChange={handleCheckboxChange}
          />
        )}
      </Box>
    </Modal>
  );
};

export default TodoDetailsModal;
