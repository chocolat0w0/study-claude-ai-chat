'use client';

import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/lib/theme';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%' },
        ml: { sm: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0 },
        height: HEADER_HEIGHT,
        transition: 'width 0.2s, margin-left 0.2s',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap component="div">
            AI Code Assistant
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
