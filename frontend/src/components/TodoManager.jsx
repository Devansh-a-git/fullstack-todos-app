import React from "react";
import { Box, Button, TextField, Divider } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import TodoList from "./todoList";
import { useState, useEffect, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { CUSTOM_SCROLLBAR_STYLES } from "../utils/constants";
import axios from "axios";
import Pagination from "./Pagination";
import AddTodoModal from "./Modals/AddTodoModal";
import TodoDetailsModal from "./Modals/TodoDetailsModal";
import AddNoteModal from "./Modals/AddNoteModal";
import EditTodoModal from "./Modals/EditTodoModal";

const TodoManager = ({ selectedUser, tags, priorityList }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimeout = useRef(null);
  const [todos, setTodos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [todoDetails, setTodoDetails] = useState({});
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTodoLoading, setEditTodoLoading] = useState(false);

  const fetchTodos = async (query = "") => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/api/todos?user_id=${
        selectedUser?.id
      }&page=${currentPage}&search=${query}`;

      const response = await fetch(url);
      const data = await response.json();
      setTodos(data.todos);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (data) => {
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos`;
    try {
      const response = await axios.post(url, data);
      console.log("object ::::: ", response);
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setOpen(false);
      fetchTodos();
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchTodos();
    }
  }, [selectedUser, currentPage]);

  useEffect(() => {
    if (selectedUser) {
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [selectedUser]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const getFilteredTodos = () => {
    const selectedTags = tags
      ?.filter((tag) => tag?.isSelected)
      ?.map((tag) => tag?.name)
      .filter(Boolean);

    const selectedPriorities = priorityList
      ?.filter((priority) => priority?.isSelected)
      ?.map((priority) => priority?.value)
      .filter(Boolean);

    if (
      selectedTags?.length === tags?.length &&
      selectedPriorities?.length === priorityList?.length
    ) {
      return todos;
    }

    const filteredTodos = todos?.filter((todo) => {
      const matchesTags =
        !selectedTags?.length ||
        todo?.tags?.some((tag) => selectedTags.includes(tag));

      const matchesPriority =
        !selectedPriorities?.length ||
        selectedPriorities.includes(todo?.priority);

      return matchesTags && matchesPriority;
    });

    return filteredTodos;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchTodos(value);
    }, 500);
  };

  const handleDelete = async (id) => {
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/${id}`;
    try {
      await axios.delete(url);
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleCheckboxChange = async (id, isChecked) => {
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/${id}`;
    try {
      await axios.patch(url, { completed: isChecked });
      // fetchTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const getTodoDetails = async (id) => {
    setDetailsLoading(true);
    setEditTodoLoading(true);
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/${id}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Todo details:", data);
      setTodoDetails(data);
    } catch (error) {
      console.error("Error fetching todo details:", error);
    } finally {
      setDetailsLoading(false);
      setEditTodoLoading(false);
    }
  };

  const handleOpenTodoDetails = (id) => {
    setDetailsOpen(true);
    getTodoDetails(id);
  };

  const handleAddNote = async (id, data) => {
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/${id}/notes`;
    try {
      const response = await axios.post(url, data);
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setOpen(false);
      setTodoDetails({});
    }
  };

  const editTodo = async (id, data) => {
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/${id}`;
    try {
      setLoading(true);
      const response = await axios.patch(url, data);
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setEditModalOpen(false);
      setTodoDetails({});
      setLoading(false);
    }
  };

  const handleAddNoteClick = (id) => {
    setAddNoteOpen(true);
    setTodoDetails({ id });
  };

  const handleEditNoteClicked = (id) => {
    setEditModalOpen(true);
    getTodoDetails(id);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
          onClick={() => setOpen(true)}
        >
          Add Todo
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            variant="outlined"
            placeholder="Search todos..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>

      <Divider />
      <Box
        sx={{
          flex: 1,
          paddingRight: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflow: "auto",
          ...CUSTOM_SCROLLBAR_STYLES,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TodoList
              todoList={getFilteredTodos()}
              handleDelete={handleDelete}
              handleCheckboxChange={handleCheckboxChange}
              handleOpenTodoDetails={handleOpenTodoDetails}
              handleAddNote={handleAddNoteClick}
              handleEditNote={handleEditNoteClicked}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handleNextPage={handleNextPage}
              handlePreviousPage={handlePreviousPage}
            />
          </>
        )}
      </Box>
      <AddTodoModal
        open={open}
        handleClose={() => {
          setOpen(false);
        }}
        submitAction={addTodo}
      />
      <TodoDetailsModal
        todoDetails={todoDetails}
        open={detailsOpen}
        handleClose={() => {
          setDetailsOpen(false);
          setTodoDetails({});
        }}
        loading={detailsLoading}
        handleDelete={(id) => {
          handleDelete(id);
          setDetailsOpen(false);
          setTodoDetails({});
        }}
        handleCheckboxChange={handleCheckboxChange}
      />
      <AddNoteModal
        open={addNoteOpen}
        handleClose={() => {
          setAddNoteOpen(false);
          setTodoDetails({});
        }}
        submitAction={handleAddNote}
        todoId={todoDetails?.id}
      />

      <EditTodoModal
        open={editModalOpen}
        todo={todoDetails}
        loading={editTodoLoading}
        handleClose={() => {
          setEditModalOpen(false);
          setTodoDetails({});
        }}
        submitAction={editTodo}
      />
    </Box>
  );
};

export default TodoManager;
