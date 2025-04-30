import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UsersContext = createContext();
const SelectedUserContext = createContext();
const SetSelectedUserContext = createContext();

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const url = `${import.meta.env.VITE_BASE_URL}/api/users`;
      const response = await axios.get(url);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users && users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  return (
    <UsersContext.Provider value={users}>
      <SelectedUserContext.Provider value={selectedUser}>
        <SetSelectedUserContext.Provider value={setSelectedUser}>
          {children}
        </SetSelectedUserContext.Provider>
      </SelectedUserContext.Provider>
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  return useContext(UsersContext);
};

export const useSelectedUser = () => {
  return useContext(SelectedUserContext);
};

export const useSetSelectedUser = () => {
  return useContext(SetSelectedUserContext);
};
