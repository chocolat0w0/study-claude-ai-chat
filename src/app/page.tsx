'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Header, Sidebar } from '@/components/common';
import { ChatInput, ChatMessage } from '@/components/chat';
import { useChat, useConversations } from '@/hooks';
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from '@/lib/theme';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, fetchConversations, deleteConversation } = useConversations();

  const handleConversationCreated = useCallback(
    (id: string) => {
      setSelectedConversationId(id);
      fetchConversations();
    },
    [fetchConversations]
  );

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    clearMessages,
  } = useChat({
    conversationId: selectedConversationId,
    onConversationCreated: handleConversationCreated,
  });

  // 会話選択時にメッセージを読み込む
  useEffect(() => {
    if (selectedConversationId) {
      loadConversation(selectedConversationId);
    }
  }, [selectedConversationId, loadConversation]);

  // メッセージ追加時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null);
    clearMessages();
  }, [clearMessages]);

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        clearMessages();
      }
    },
    [deleteConversation, selectedConversationId, clearMessages]
  );

  const handleSendMessage = useCallback(
    async (content: string, images?: { data: string; mimeType: string }[]) => {
      await sendMessage(content, images);
      fetchConversations();
    },
    [sendMessage, fetchConversations]
  );

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
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {messages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 3,
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              新しいチャットを開始
            </Typography>
            <Typography variant="body2" color="text.secondary">
              メッセージを入力して、コーディングの質問をしてください
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              左側のサイドバーから過去の会話を選択することもできます
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
            }}
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}

        <ChatInput onSendMessage={handleSendMessage} loading={isLoading} />
      </Box>
    </Box>
  );
}
