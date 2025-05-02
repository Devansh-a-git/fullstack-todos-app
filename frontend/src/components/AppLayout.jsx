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
  const selectedUser = useSelectedUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const url = `${import.meta.env.VITE_BASE_URL}/api/users/tags?user_id=${
          selectedUser?.id
        }`;
        const response = await fetch(url);
        const data = await response.json();
        setTags(addIsSelected(data, true));
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedUser) {
      fetchTags();
    }
  }, [selectedUser]);

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
        />
        {selectedUser ? (
          <TodoManager
            selectedUser={selectedUser}
            tags={tags}
            priorityList={priorityList}
          />
        ) : null}
      </Box>
    </>
  );
};

export default AppLayout;
