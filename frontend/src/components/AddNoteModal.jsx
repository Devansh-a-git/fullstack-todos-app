import { Box, Modal, TextField, Button, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { MODAL_STYLES } from "../constants";

const AddNoteModal = ({ open, handleClose, submitAction, todoId }) => {
  const [noteContent, setNoteContent] = useState("");

  const handleChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleSubmit = () => {
    submitAction(todoId, { content: noteContent.trim() });
    setNoteContent("");
    handleClose();
  };

  const handleCancel = () => {
    setNoteContent("");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={MODAL_STYLES}>
        <TextField
          label="Note Content"
          value={noteContent}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
        <Tooltip
          title="Please write something..."
          arrow
          placement="bottom"
          disableHoverListener={noteContent.trim()}
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              sx={{ mt: 2 }}
              disabled={!noteContent.trim()}
            >
              Add Note
            </Button>
          </span>{" "}
        </Tooltip>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          fullWidth
          sx={{ mt: 1 }}
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default AddNoteModal;
