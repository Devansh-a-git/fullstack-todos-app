import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import DownloadIcon from "@mui/icons-material/Download";

import {
  Box,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import {
  useUsers,
  useSelectedUser,
  useSetSelectedUser,
} from "../context/UsersContext";

const Header = () => {
  const users = useUsers();
  const selectedUser = useSelectedUser();
  const setSelectedUser = useSetSelectedUser();
  const [jsonLoading, setJsonLoading] = React.useState(false);
  const [csvLoading, setCsvLoading] = React.useState(false);

  const handleUserChange = (event) => {
    const selectedUserId = event.target.value;
    const selectedUserObject = users.find((user) => user.id === selectedUserId);
    setSelectedUser(selectedUserObject);
  };

  const handleExport = async (format) => {
    if (format === "JSON") {
      setJsonLoading(true);
    } else if (format === "CSV") {
      setCsvLoading(true);
    }
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/export?user_id=${
      selectedUser?.id
    }&format=${format}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Todo details:", data);
    } catch (error) {
      console.error("Error fetching todo details:", error);
    } finally {
      if (format === "JSON") {
        setJsonLoading(false);
      } else if (format === "CSV") {
        setCsvLoading(false);
      }
    }
  };

  return (
    <Box bgcolor="white" sx={{ boxShadow: 3, width: "100%" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          Todo List
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ textTransform: "none" }}
            onClick={() => handleExport("JSON")}
          >
            {jsonLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size="15px" />
              </Box>
            ) : (
              "Export as JSON"
            )}
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ textTransform: "none" }}
            onClick={() => handleExport("CSV")}
          >
            {csvLoading ? (
              <Box
                sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}
              >
                <CircularProgress />
              </Box>
            ) : (
              "Export as CSV"
            )}
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedUser?.id || ""}
                onChange={handleUserChange}
                displayEmpty
                sx={{ minWidth: 200 }}
              >
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Loading users...</MenuItem>
                )}
              </Select>
            </FormControl>
            <Avatar alt="User Avatar" src="/frontend1/placeholder-avatar.png" />
          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Header;
