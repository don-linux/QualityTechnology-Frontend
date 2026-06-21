import React, { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, useLocation } from "react-router-dom";
import { DASHBOARD_SECTION, MENU_SECTIONS } from "./menuConfig.jsx";

const DRAWER_WIDTH = 270;
const COLLAPSED_WIDTH = 80;

function isPathActive(pathname, target) {
  if (!target) return false;
  return pathname === target || pathname.startsWith(target + "/");
}

function flattenItems(section) {
  const fromSubsections = section.subsections?.flatMap((s) => s.items) ?? [];
  const fromItems = section.items ?? [];
  return [...fromSubsections, ...fromItems];
}

function sectionHasActiveItem(section, pathname) {
  return flattenItems(section).some((item) => isPathActive(pathname, item.to));
}

function navItemSx(pathname, path, drawerOpen, { pl } = {}) {
  const active = isPathActive(pathname, path);
  return {
    borderRadius: 1,
    mb: 0.5,
    ...(pl !== undefined ? { pl } : {}),
    backgroundColor: active ? "rgba(255,255,255,0.18)" : "transparent",
    "&:hover": { backgroundColor: active ? "rgba(255,255,255,0.24)" : "#43A047" },
    justifyContent: drawerOpen ? "flex-start" : "center",
  };
}

function moduleHeaderSx(hasActive) {
  return {
    borderRadius: 1,
    mt: 1.5,
    mb: 0.5,
    px: 1,
    py: 0.75,
    backgroundColor: hasActive ? "rgba(255,255,255,0.08)" : "transparent",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.16)" },
  };
}

function subHeaderSx(hasActive) {
  return {
    borderRadius: 1,
    ml: 2,
    mt: 0.5,
    mb: 0.25,
    px: 1,
    py: 0.5,
    backgroundColor: hasActive ? "rgba(255,255,255,0.06)" : "transparent",
    "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
  };
}

function NavItem({ to, icon, label, drawerOpen, pathname, pl }) {
  const content = (
    <ListItemButton component={Link} to={to} sx={navItemSx(pathname, to, drawerOpen, { pl })}>
      <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>{icon}</ListItemIcon>
      {drawerOpen && <ListItemText primary={label} />}
    </ListItemButton>
  );

  if (drawerOpen) return content;
  return (
    <Tooltip title={label} placement="right" arrow>
      {content}
    </Tooltip>
  );
}

function SubSection({ sub, drawerOpen, pathname }) {
  const hasActive = useMemo(
    () => sub.items.some((item) => isPathActive(pathname, item.to)),
    [sub, pathname]
  );
  const [open, setOpen] = useState(hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  return (
    <>
      <ListItemButton onClick={() => setOpen((prev) => !prev)} sx={subHeaderSx(hasActive)}>
        <ListItemText
          primary={sub.sublabel}
          primaryTypographyProps={{
            fontWeight: "bold",
            color: sub.sublabelColor,
            fontSize: 13,
          }}
        />
        {open ? (
          <ExpandLess sx={{ color: sub.sublabelColor, fontSize: 20 }} />
        ) : (
          <ExpandMore sx={{ color: sub.sublabelColor, fontSize: 20 }} />
        )}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {sub.items.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              drawerOpen={drawerOpen}
              pathname={pathname}
              pl={5}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}

function ModuleSection({ section, drawerOpen, pathname }) {
  const hasActive = useMemo(
    () => sectionHasActiveItem(section, pathname),
    [section, pathname]
  );
  const [open, setOpen] = useState(hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  if (!drawerOpen) {
    return (
      <>
        {flattenItems(section).map((item) => (
          <NavItem key={item.to} {...item} drawerOpen={drawerOpen} pathname={pathname} />
        ))}
      </>
    );
  }

  return (
    <>
      <ListItemButton onClick={() => setOpen((prev) => !prev)} sx={moduleHeaderSx(hasActive)}>
        {section.moduleIcon && (
          <ListItemIcon sx={{ color: "#C8E6C9", minWidth: 0, mr: 1.5 }}>
            {section.moduleIcon}
          </ListItemIcon>
        )}
        <ListItemText
          primary={section.label}
          primaryTypographyProps={{
            fontWeight: "bold",
            color: "#C8E6C9",
            fontSize: 13,
            letterSpacing: 0.5,
          }}
        />
        {open ? (
          <ExpandLess sx={{ color: "#C8E6C9" }} />
        ) : (
          <ExpandMore sx={{ color: "#C8E6C9" }} />
        )}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {section.subsections &&
            section.subsections.map((sub) => (
              <SubSection
                key={sub.sublabel}
                sub={sub}
                drawerOpen={drawerOpen}
                pathname={pathname}
              />
            ))}

          {section.items &&
            section.items.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                drawerOpen={drawerOpen}
                pathname={pathname}
                pl={4}
              />
            ))}
        </List>
      </Collapse>
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
        width: drawerOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        "& .MuiDrawer-paper": {
          borderRadius: 0,
          width: drawerOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
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
        <ModuleSection
          section={DASHBOARD_SECTION}
          drawerOpen={drawerOpen}
          pathname={pathname}
        />

        {MENU_SECTIONS.filter((s) => hasModulo(s.modulo)).map((section) => (
          <ModuleSection
            key={section.modulo}
            section={section}
            drawerOpen={drawerOpen}
            pathname={pathname}
          />
        ))}
      </List>
    </Drawer>
  );
}
