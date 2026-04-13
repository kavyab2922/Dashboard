import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./sideBar";

const Layout = () => {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
