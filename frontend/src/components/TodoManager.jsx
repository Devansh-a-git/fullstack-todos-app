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

const TodoManager = ({ filters, selectedUser, tags, priorityList }) => {
  const [sortBy, setSortBy] = useState({ date: "desc" });
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
      const body = { filters, sortBy };
      const url = `${import.meta.env.VITE_BASE_URL}/api/todos?user_id=${
        selectedUser?.id
      }&page=${currentPage}&search=${query}`;

      const response = await axios.post(url, body);
      const data = response.data;
      console.log("data ::::: ", data);
      setTodos(data.todos);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (data) => {
    const url = `${import.meta.env.VITE_BASE_URL}/api/todos/add_todo`;
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

  useEffect(() => {
    if (selectedUser) {
      fetchTodos();
    }
  }, [selectedUser, currentPage, filters, sortBy]);

  useEffect(() => {
    if (selectedUser) {
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log(todos);
  }, [todos]);

  const sortByDate = () => {
    sortBy?.date === "desc"
      ? setSortBy({ date: "asc" })
      : setSortBy({ date: "desc" });
  };

  const sortByPriority = () => {
    sortBy?.title === "asc"
      ? setSortBy({ title: "desc" })
      : setSortBy({ title: "asc" });
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
        <Box
          sx={{
            display: "flex",
            // justifyContent: "space-between",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Button variant="outlined" onClick={sortByDate}>
            sort by date
          </Button>
          <Button variant="outlined" onClick={sortByPriority}>
            sort by title
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: "none" }}
            onClick={() => setOpen(true)}
          >
            Add Todo
          </Button>
        </Box>

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
              todoList={todos}
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
