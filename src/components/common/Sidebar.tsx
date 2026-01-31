'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { SIDEBAR_WIDTH, HEADER_HEIGHT } from '@/lib/theme';
import type { Conversation } from '@/types/chat';

interface SidebarProps {
  open: boolean;
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  open,
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          チャット履歴
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          fullWidth
          sx={{ justifyContent: 'flex-start', py: 1 }}
        >
          新しいチャット
        </Button>
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {conversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              会話履歴がありません
            </Typography>
          </Box>
        ) : (
          conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <ChatBubbleOutlineIcon sx={{ mr: 1.5, fontSize: 20, opacity: 0.7 }} />
                <ListItemText
                  primary={conversation.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontSize: '0.875rem' },
                  }}
                  secondary={`${conversation.messageCount} メッセージ`}
                  secondaryTypographyProps={{
                    sx: { fontSize: '0.75rem' },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Drawer>
  );
}
