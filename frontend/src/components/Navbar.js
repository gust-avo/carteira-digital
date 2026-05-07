import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Tooltip title="Abrir menu">
            <IconButton color="inherit" edge="start" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <AccountBalanceWalletIcon sx={{ ml: 2, mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            Senaibank Digital
          </Typography>
          <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" }, mr: 1 }}>
            {user?.nome}
          </Typography>
          <Tooltip title="Sair">
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountBalanceWalletIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Minhas contas" secondary={user?.email} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
