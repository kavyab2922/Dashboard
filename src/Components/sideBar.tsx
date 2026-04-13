import { Box, Typography } from "@mui/material";

const Sidebar = () => {
  return (
    <Box
      component="aside"
      sx={{ borderRight: "1px solid #e5e7eb", minHeight: "calc(100vh - 65px)", p: 2, width: 240 }}
    >
      <Typography variant="body1">Sidebar</Typography>
    </Box>
  );
};

export default Sidebar;
