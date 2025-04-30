import {
  Box,
  Modal,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import { MODAL_STYLES } from "../constants";
import { useSelectedUser, useUsers } from "../context/UsersContext";

const AddTodoModal = ({ open, handleClose, submitAction }) => {
  const users = useUsers();
  const selectedUser = useSelectedUser();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",

    tags: [],
    assignedUsers: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAssignedUsersChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      assignedUsers: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleSubmit = () => {
    const formattedData = {
      ...formData,
      user_id: selectedUser.id,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
    };
    submitAction(formattedData);
    handleClose();
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      priority: "",

      tags: [],
      assignedUsers: [],
    });
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
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          select
          fullWidth
          margin="normal"
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
        <TextField
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl sx={{ marginBottom: 3 }} fullWidth margin="normal">
          <InputLabel>Assigned Users</InputLabel>
          <Select
            multiple
            value={formData.assignedUsers}
            onChange={handleAssignedUsersChange}
            renderValue={(selected) =>
              users
                ?.filter((user) => selected.indexOf(user.id) > -1)
                .map((user) => user.username)
                .join(", ")
            }
          >
            {users
              ?.filter((user) => user.id !== selectedUser?.id)
              ?.map((user) => (
                <MenuItem value={user?.id} key={user?.id}>
                  <Checkbox
                    checked={formData.assignedUsers.indexOf(user?.id) > -1}
                  />
                  <ListItemText primary={user?.username} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", gap: "8px" }}
        >
          <Tooltip
            title="Title, Description & Priority are mandatory fields"
            arrow
            placement="bottom"
            disableHoverListener={
              formData.title.trim() &&
              formData.priority.trim() &&
              formData.description.trim()
            }
          >
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                fullWidth
                // sx={{ mt: 1 }}
                disabled={
                  !formData.title.trim() ||
                  !formData.priority.trim() ||
                  !formData.description.trim()
                }
              >
                Submit
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleCancel}
            // fullWidth
            // sx={{ mt: 1 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTodoModal;
