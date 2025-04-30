import React, { useRef } from "react";
import Chip from "./Chip";
import { Box, IconButton, Typography } from "@mui/material";
import NoteIcon from "@mui/icons-material/Note";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TodoBox = ({
  todo,
  handleDelete,
  handleCheckboxChange,
  handleOpenTodoDetails,
  handleAddNote,
  handleEditNote,
}) => {
  const debounceTimeout = useRef(null);

  const handleDebouncedCheckboxChange = (id, isChecked) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (isChecked === todo?.completed) return;
      handleCheckboxChange(id, isChecked);
    }, 300);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 1,
        boxShadow: 1,
        padding: 2,
        display: "flex",
        gap: 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleOpenTodoDetails(todo?.id);
      }}
    >
      <Box height="100%" display="flex" alignItems="flex-start" pt="8px">
        <input
          defaultChecked={todo?.completed}
          type="checkbox"
          onClick={(e) => {
            e.stopPropagation();
            handleDebouncedCheckboxChange(todo?.id, e.target.checked);
          }}
        />
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent={"space-between"}
        flexGrow={1}
      >
        <Box display="flex" justifyContent={"space-between"}>
          <Typography variant="h6">{todo?.title}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              title="Add note"
              onClick={(e) => {
                e.stopPropagation();
                handleAddNote(todo?.id);
              }}
            >
              <NoteIcon />
            </IconButton>
            <IconButton
              size="small"
              title="Edit todo"
              onClick={(e) => {
                e.stopPropagation();
                handleEditNote(todo?.id);
              }}
            >
              <EditIcon />
            </IconButton>

            <IconButton
              size="small"
              title="Delete todo"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(todo?.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  fontSize: "0.85rem",
                }}
              >
                <Chip data={todo?.priority} variant={todo?.priority} />

                {todo?.tags &&
                  todo?.tags?.map((tag, index) => (
                    <Chip key={index} data={tag} variant="tag" />
                  ))}

                {todo?.assigned_users &&
                  todo?.assigned_users?.map((user, index) => (
                    <Chip key={index} data={user} variant="user" />
                  ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TodoBox;
