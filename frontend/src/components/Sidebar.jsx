import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import { CUSTOM_SCROLLBAR_STYLES } from "../utils/constants";

const Sidebar = ({
  tags,
  handleTagChange,
  priorityList,
  handlePriorityChange,
  loading,
  handleFilters,
  handleReset,
  fetchAllTags,
}) => {
  return (
    <Box sx={{ width: 250 }}>
      <Box
        sx={{
          width: 250,
          backgroundColor: "#fff",
          borderRadius: 1,
          boxShadow: 1,
          padding: 2,
          height: "calc(100vh - 110px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom mb="15px">
          Filters
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Priority
          </Typography>
          {priorityList?.map((priority) => (
            <FormControlLabel
              key={priority.value}
              control={
                <Checkbox
                  value={priority.value}
                  checked={priority.isSelected}
                  onChange={() => handlePriorityChange(priority)}
                />
              }
              label={priority.label}
            />
          ))}
        </Box>

        <Divider sx={{ marginY: 2 }} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={600} variant="subtitle1">
            Tags
          </Typography>
          {loading ? (
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}
            >
              <CircularProgress />
            </Box>
          ) : tags?.length ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                height: "calc(100vh - 600px)",
                overflow: "auto",
                ...CUSTOM_SCROLLBAR_STYLES,
              }}
            >
              {tags.map((tag) => (
                <FormControlLabel
                  key={tag?.id}
                  id={tag?.id}
                  control={<Checkbox value={tag?.id} />}
                  label={tag?.name}
                  checked={tag?.isSelected}
                  onChange={() => {
                    handleTagChange(tag);
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="subtitle6">No tags created yet</Typography>
          )}
        </Box>
        {!loading && !!tags.length && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Button variant="outlined" onClick={fetchAllTags}>
              Get all Tags
            </Button>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>{" "}
              <Button variant="contained" onClick={handleFilters}>
                Apply
              </Button>{" "}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
