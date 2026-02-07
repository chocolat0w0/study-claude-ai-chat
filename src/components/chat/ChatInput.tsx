'use client';

import { useState, useCallback, KeyboardEvent, useRef, ClipboardEvent } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

interface ImageAttachment {
  data: string; // Base64
  mimeType: string;
  preview: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, images?: ImageAttachment[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ChatInput({ onSendMessage, disabled = false, loading = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || images.length > 0) && !disabled && !loading) {
      onSendMessage(trimmedMessage, images.length > 0 ? images : undefined);
      setMessage('');
      setImages([]);
    }
  }, [message, images, onSendMessage, disabled, loading]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const processImage = useCallback((file: File): Promise<ImageAttachment | null> => {
    return new Promise((resolve) => {
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        alert(`サポートされていない形式です: ${file.type}\n対応形式: JPEG, PNG, GIF, WebP`);
        resolve(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`ファイルサイズが大きすぎます: ${(file.size / 1024 / 1024).toFixed(2)}MB\n最大サイズ: 5MB`);
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1]; // Remove data:image/xxx;base64, prefix
        resolve({
          data: base64Data,
          mimeType: file.type,
          preview: result,
        });
      };
      reader.onerror = () => {
        alert('画像の読み込みに失敗しました');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
      const processedImages = await Promise.all(imageFiles.map(processImage));
      const validImages = processedImages.filter((img): img is ImageAttachment => img !== null);

      setImages((prev) => [...prev, ...validImages]);
    },
    [processImage]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItems = Array.from(items).filter((item) => item.type.startsWith('image/'));
      if (imageItems.length === 0) return;

      e.preventDefault();
      const files = imageItems.map((item) => item.getAsFile()).filter((file): file is File => file !== null);
      const processedImages = await Promise.all(files.map(processImage));
      const validImages = processedImages.filter((img): img is ImageAttachment => img !== null);

      setImages((prev) => [...prev, ...validImages]);
    },
    [processImage]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer?.files;
      await handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Image Preview */}
      {images.length > 0 && (
        <Box sx={{ p: 2, pb: 0 }}>
          <ImageList sx={{ maxHeight: 200 }} cols={4} gap={8}>
            {images.map((image, index) => (
              <ImageListItem key={index}>
                <img
                  src={image.preview}
                  alt={`添付画像 ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <ImageListItemBar
                  sx={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                  }}
                  position="top"
                  actionIcon={
                    <IconButton
                      sx={{ color: 'white' }}
                      size="small"
                      onClick={() => removeImage(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}

      {/* Drag & Drop Overlay */}
      {dragActive && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            border: '2px dashed #2196f3',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'primary.main' }}>
            <AttachFileIcon sx={{ fontSize: 48, mb: 1 }} />
            <Box>画像をドロップしてください</Box>
          </Box>
        </Box>
      )}

      {/* Input Area */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          p: 2,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <IconButton
          color="primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          sx={{
            alignSelf: 'flex-end',
            width: 48,
            height: 48,
          }}
        >
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          multiline
          maxRows={6}
          placeholder="メッセージを入力... (Cmd/Ctrl + Enter で送信、Ctrl+V で画像貼り付け)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled || loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.default',
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={(!message.trim() && images.length === 0) || disabled || loading}
          sx={{
            alignSelf: 'flex-end',
            width: 48,
            height: 48,
          }}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
