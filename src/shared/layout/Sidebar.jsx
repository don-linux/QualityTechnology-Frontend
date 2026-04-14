import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, useLocation } from "react-router-dom";
import { FIXED_ITEMS, MENU_SECTIONS } from "./menuConfig.jsx";

const DRAWER_WIDTH = 270;

function navSx(pathname, path, drawerOpen, { exact = true, pl } = {}) {
  const active = exact ? pathname === path : pathname.startsWith(path);
  return {
    borderRadius: 1,
    mb: 0.5,
    ...(pl !== undefined ? { pl } : {}),
    backgroundColor: active ? "rgba(255,255,255,0.18)" : "transparent",
    "&:hover": { backgroundColor: active ? "rgba(255,255,255,0.24)" : "#43A047" },
    justifyContent: drawerOpen ? "flex-start" : "center",
  };
}

function NavItem({ to, icon, label, drawerOpen, pathname, pl }) {
  return (
    <ListItemButton component={Link} to={to} sx={navSx(pathname, to, drawerOpen, { pl })}>
      <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
      {drawerOpen && <ListItemText primary={label} />}
    </ListItemButton>
  );
}

function SectionHeader({ label, drawerOpen }) {
  if (!drawerOpen) return null;
  return (
    <Typography sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}>
      {label}
    </Typography>
  );
}

function CollapsibleSection({ section, drawerOpen, pathname }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(section.collapsePath)) setOpen(true);
  }, [pathname, section.collapsePath]);

  return (
    <>
      <SectionHeader label={section.label} drawerOpen={drawerOpen} />
      <ListItemButton onClick={() => setOpen(!open)} sx={navSx(pathname, section.collapsePath, drawerOpen, { exact: false })}>
        <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{section.collapseIcon}</ListItemIcon>
        {drawerOpen && <ListItemText primary={section.collapseLabel} />}
        {drawerOpen && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
      <Collapse in={open && drawerOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {section.items.map(({ to, icon, label }) => (
            <ListItemButton key={to} component={Link} to={to} sx={navSx(pathname, to, drawerOpen, { pl: 5 })}>
              <ListItemIcon sx={{ color: "white" }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
}

function SubsectionedSection({ section, drawerOpen, pathname }) {
  return (
    <>
      <SectionHeader label={section.label} drawerOpen={drawerOpen} />
      {section.subsections.map((sub) => (
        <React.Fragment key={sub.sublabel}>
          {drawerOpen && (
            <Typography sx={{ fontWeight: "bold", color: sub.sublabelColor, ml: 2, mt: 1, mb: 0.5, fontSize: "13px" }}>
              {sub.sublabel}
            </Typography>
          )}
          {sub.items.map((item) => (
            <NavItem key={item.to} {...item} drawerOpen={drawerOpen} pathname={pathname} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

function SimpleSection({ section, drawerOpen, pathname }) {
  return (
    <>
      <SectionHeader label={section.label} drawerOpen={drawerOpen} />
      {section.items.map((item) => (
        <NavItem key={item.to} {...item} drawerOpen={drawerOpen} pathname={pathname} />
      ))}
    </>
  );
}

export default function Sidebar({ drawerOpen, hasModulo }) {
  const { pathname } = useLocation();

  return (
    <Drawer
      variant="permanent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? DRAWER_WIDTH : 80,
        "& .MuiDrawer-paper": {
          borderRadius: 0,
          width: drawerOpen ? DRAWER_WIDTH : 80,
          background: "linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)",
          color: "white",
          borderRight: "none",
          paddingTop: "70px",
          overflowX: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <img
          src="/images/quality.png"
          alt="Logo"
          width={drawerOpen ? "110" : "40"}
          style={{ marginTop: "10px", transition: "width 0.3s ease" }}
        />
      </Box>

      <List sx={{ px: drawerOpen ? 1 : 0 }}>
        {drawerOpen && (
          <Typography sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mb: 1 }}>
            DASHBOARD
          </Typography>
        )}
        {FIXED_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} drawerOpen={drawerOpen} pathname={pathname} />
        ))}

        {MENU_SECTIONS.filter((s) => hasModulo(s.modulo)).map((section) => {
          if (section.collapsible) return <CollapsibleSection key={section.modulo} section={section} drawerOpen={drawerOpen} pathname={pathname} />;
          if (section.subsections) return <SubsectionedSection key={section.modulo} section={section} drawerOpen={drawerOpen} pathname={pathname} />;
          return <SimpleSection key={section.modulo} section={section} drawerOpen={drawerOpen} pathname={pathname} />;
        })}
      </List>
    </Drawer>
  );
}
