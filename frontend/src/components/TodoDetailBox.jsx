import { Box, IconButton, Typography } from "@mui/material";
import React, { useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "./Chip";

const TodoDetailBox = ({
  todo,
  handleDelete,
  handleCheckboxChange,
  handleOpenTodoDetails,
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
        height: "50vh",
        backgroundColor: "#fff",
        borderRadius: 1,
        boxShadow: 1,
        padding: 2,
        // display: "flex",
        gap: 1,
      }}
      onClick={() => handleOpenTodoDetails(todo?.id)}
    >
      <Box sx={{ display: "flex", gap: "5px" }}>
        <Box height="100%" display="flex" alignItems="flex-start" pt="8px">
          <input
            defaultChecked={todo?.completed}
            type="checkbox"
            onChange={(e) =>
              handleDebouncedCheckboxChange(todo?.id, e.target.checked)
            }
          />
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent={"flex-start"}
          flexGrow={1}
        >
          <Box display="flex" justifyContent={"space-between"}>
            <Typography variant="h6">{todo?.title}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                title="Delete todo"
                color="error"
                onClick={() => handleDelete(todo?.id)}
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
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {todo?.description}
                </Typography>
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
      <Box mt={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Created on: {new Date(todo?.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body1" color="text.primary" fontWeight={600}>
            Notes :
          </Typography>
          <Box ml={1}>
            {todo?.notes?.length > 0 ? (
              todo?.notes?.map((note, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  {note?.content}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No notes available
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TodoDetailBox;
