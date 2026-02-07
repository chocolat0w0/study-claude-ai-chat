'use client';

import { useState } from 'react';
import { Box, Avatar, Typography, ImageList, ImageListItem, Dialog } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@/components/code';
import type { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        backgroundColor: isUser ? 'transparent' : 'rgba(144, 202, 249, 0.08)',
        borderRadius: 1,
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {isUser ? 'あなた' : 'AI Assistant'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(message.createdAt)}
          </Typography>
        </Box>

        {/* Images */}
        {message.images && message.images.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <ImageList cols={Math.min(message.images.length, 3)} gap={8}>
              {message.images.map((image, index) => (
                <ImageListItem key={image.id} sx={{ cursor: 'pointer' }}>
                  <img
                    src={`data:${image.mimeType};base64,${image.data}`}
                    alt={`添付画像 ${index + 1}`}
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                    onClick={() => setExpandedImage(`data:${image.mimeType};base64,${image.data}`)}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        {/* Image Expansion Dialog */}
        <Dialog
          open={expandedImage !== null}
          onClose={() => setExpandedImage(null)}
          maxWidth="lg"
          onClick={() => setExpandedImage(null)}
        >
          {expandedImage && (
            <img
              src={expandedImage}
              alt="拡大画像"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          )}
        </Dialog>

        <Box
          sx={{
            '& p': {
              margin: 0,
              marginBottom: 1,
              '&:last-child': {
                marginBottom: 0,
              },
            },
            '& ul, & ol': {
              marginTop: 0.5,
              marginBottom: 1,
              paddingLeft: 3,
            },
            '& li': {
              marginBottom: 0.5,
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: 2,
              marginBottom: 1,
              fontWeight: 600,
            },
            '& code:not(pre code)': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.875em',
              fontFamily: 'monospace',
            },
            '& a': {
              color: '#58a6ff',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              marginTop: 1,
              marginBottom: 2,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            '& th, & td': {
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              textAlign: 'left',
            },
            '& th': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              fontWeight: 600,
            },
            '& tr:nth-of-type(even)': {
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            },
            '& blockquote': {
              margin: '16px 0',
              padding: '8px 16px',
              borderLeft: '4px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& p': {
                margin: 0,
              },
            },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const inline = !className;

                return !inline && match ? (
                  <CodeBlock code={codeString} language={match[1]} showLineNumbers />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Box>
      </Box>
    </Box>
  );
}
