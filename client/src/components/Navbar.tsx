import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import {
  School,
  Book,
  Person,
  Assessment,
  Grade,
  Timeline,
  Menu as MenuIcon,
  TableChart,
} from "@mui/icons-material";

const drawerWidth = 240;

const menuItems = [
  { text: "Programlar", icon: <School />, path: "/programs" },
  { text: "Dersler", icon: <Book />, path: "/courses" },
  { text: "Öğrenciler", icon: <Person />, path: "/students" },
  { text: "Değerlendirmeler", icon: <Assessment />, path: "/evaluations" },
  { text: "Notlar", icon: <Grade />, path: "/grades" },
  { text: "Öğrenme Çıktıları", icon: <Timeline />, path: "/learning-outcomes" },
  { text: "Tablolar", icon: <TableChart />, path: "/tables" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
          bgcolor: "#03823c",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            sx={{
              height: 40,
              width: 40,
              marginRight: 2,
            }}
            alt="EBS Logo"
            src="/logo192.png"
          />
          <Typography variant="h6" noWrap component="div">
            Eğitim Bilgi Sistemi
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              top: 64,
              height: "calc(100% - 64px)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar;
