import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TodoManager from "./TodoManager";
import { Box } from "@mui/material";
import { useSelectedUser } from "../context/UsersContext";
import { addIsSelected } from "../utils/utilityFunctions";
import { PRIORITY_LIST } from "../utils/constants";

const AppLayout = () => {
  const [tags, setTags] = useState([]);
  const [priorityList, setPriorityList] = useState(
    addIsSelected(PRIORITY_LIST, true)
  );
  const [filters, setFilters] = useState({
    tags: [],
    priority: priorityList.map((p) => p.value),
  });
  const selectedUser = useSelectedUser();
  const [loading, setLoading] = useState(false);

  const fetchTags = async (fetchAll) => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/api/users/tags?user_id=${
        selectedUser?.id
      }${fetchAll ? "&is_all=true" : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      setTags(addIsSelected(data, true));
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  function handleTagChange(tag) {
    const updatedTags = tags.map((t) => {
      if (t.id === tag.id) {
        return { ...t, isSelected: !t.isSelected };
      }
      return t;
    });
    setTags(updatedTags);
  }

  function handlePriorityChange(priority) {
    const updatedPriorityList = priorityList.map((p) => {
      if (p.value === priority.value) {
        return { ...p, isSelected: !p.isSelected };
      }
      return p;
    });
    setPriorityList(updatedPriorityList);
  }

  const handleFilters = () => {
    const selectedTags = tags
      .filter((tag) => tag.isSelected)
      .map((tag) => tag.id);
    const selectedPriorities = priorityList
      .filter((p) => p.isSelected)
      .map((p) => p.value);
    setFilters({
      tags: selectedTags.length === tags.length ? [] : selectedTags,
      priority: selectedPriorities,
    });
  };

  const handleReset = () => {
    const allTags = tags.map((tag) => ({ ...tag, isSelected: true }));
    const allPriorities = priorityList.map((p) => ({ ...p, isSelected: true }));
    setTags(allTags);
    setPriorityList(allPriorities);

    setFilters({
      tags: [],
      priority: allPriorities.map((p) => p.value),
    });
  };

  const fetchAllTags = () => {
    if (selectedUser) {
      fetchTags(true);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchTags();
    }
  }, [selectedUser]);

  return (
    <>
      <Header />
      <Box
        style={{
          display: "flex",
          gap: "20px",
          padding: "25px",
          backgroundColor: "#f5f7fa",
          height: "calc(100vh - 64px)",
        }}
      >
        <Sidebar
          tags={tags}
          priorityList={priorityList}
          handleTagChange={handleTagChange}
          handlePriorityChange={handlePriorityChange}
          loading={loading}
          handleFilters={handleFilters}
          handleReset={handleReset}
          fetchAllTags={fetchAllTags}
        />
        {selectedUser ? (
          <TodoManager
            selectedUser={selectedUser}
            tags={tags}
            priorityList={priorityList}
            filters={filters}
          />
        ) : null}
      </Box>
    </>
  );
};

export default AppLayout;
