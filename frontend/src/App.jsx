import "./App.css";
import { Box } from "@mui/material";
import AppLayout from "./components/AppLayout";
import { UsersProvider } from "./context/UsersContext";

function App() {
  return (
    <UsersProvider>
      <Box height={"100vh"} width={"100vw"}>
        <AppLayout />
      </Box>
    </UsersProvider>
  );
}

export default App;
