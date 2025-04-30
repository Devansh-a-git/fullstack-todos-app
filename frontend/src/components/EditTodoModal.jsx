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
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { MODAL_STYLES } from "../constants";
import { useSelectedUser, useUsers } from "../context/UsersContext";

const EditTodoModal = ({
  open,
  handleClose,
  submitAction,
  todo,
  availableTags,
  loading,
}) => {
  const users = useUsers();
  const selectedUser = useSelectedUser();
  const [formData, setFormData] = useState({
    title: todo?.title || "",
    description: todo?.description || "",
    priority: todo?.priority || "",
    tags: todo?.tags || [],
    assigned_users: todo?.assigned_users || [],
    notes: todo?.notes || [],
  });

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo?.title || "",
        description: todo?.description || "",
        priority: todo?.priority || "",
        tags: todo?.tags || [],
        assigned_users: users
          ?.filter((user) => todo.assigned_users?.includes(user.username))
          .map((user) => user.id),
        notes: todo?.notes || [],
      });
    }
  }, [todo, users]);

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
      assigned_users: value,
    });
  };

  const removeNote = (index) => {
    const updatedNotes = formData.notes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      notes: updatedNotes,
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.priority.trim()) {
      alert("Title and Priority cannot be empty.");
      return;
    }
    submitAction(todo?.id, formData);
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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
            {/* <FormControl fullWidth margin="normal">
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={formData.tags}
                onChange={handleTagsChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {availableTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    <Checkbox checked={formData.tags.indexOf(tag) > -1} />
                    <ListItemText primary={tag} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Users</InputLabel>
              <Select
                multiple
                value={formData.assigned_users}
                onChange={handleAssignedUsersChange}
                renderValue={(selected) =>
                  users
                    ?.filter((user) => selected.includes(user.id))
                    .map((user) => user.username)
                    .join(", ")
                }
              >
                {users
                  ?.filter((user) => user.id !== selectedUser?.id)
                  ?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox
                        checked={formData.assigned_users.includes(user.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData((prevFormData) => {
                            const updatedAssignedUsers = isChecked
                              ? [...prevFormData.assigned_users, user.id]
                              : prevFormData.assigned_users.filter(
                                  (id) => id !== user.id
                                );
                            return {
                              ...prevFormData,
                              assigned_users: updatedAssignedUsers,
                            };
                          });
                        }}
                      />
                      <ListItemText primary={user.username} />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {formData.notes.map((note, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1}>
                <TextField
                  label={`Note ${index + 1}`}
                  value={note.content}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  margin="normal"
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeNote(index)}
                >
                  Remove
                </Button>
              </Box>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              sx={{ mt: 2 }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              fullWidth
              sx={{ mt: 1 }}
            >
              Cancel
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default EditTodoModal;
