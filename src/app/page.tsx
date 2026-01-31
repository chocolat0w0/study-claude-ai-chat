'use client';

import { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { Header, Sidebar, Conversation } from '@/components/common';
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/lib/theme';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
    }
  }, [selectedConversationId]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleMenuClick} sidebarOpen={sidebarOpen} />
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: `${HEADER_HEIGHT}px`,
          pl: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
          transition: 'padding-left 0.2s',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            新しいチャットを開始
          </Typography>
          <Typography variant="body2" color="text.secondary">
            メッセージを入力して、コーディングの質問をしてください
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
