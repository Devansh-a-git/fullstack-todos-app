import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { Box } from "@mui/material";
import MainComponent from "./components/MainComponent";
import { UsersProvider } from "./context/UsersContext";

function App() {
  return (
    <UsersProvider>
      <Box height={"100vh"} width={"100vw"}>
        <MainComponent />
      </Box>
    </UsersProvider>
  );
}

export default App;
