'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Collapse,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! How can I help you today?',
      sender: 'support',
      time: '10:00 AM',
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');

    // Simulate support response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: 'Thank you for your message. Our team will get back to you shortly.',
          sender: 'support',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      <Collapse
        in={isOpen}
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          zIndex: 1000,
          maxWidth: 350,
          width: '100%',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
            <Typography variant="h6">Support Chat</Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              height: 350,
              overflowY: 'auto',
              bgcolor: 'background.default',
              p: 2,
            }}
          >
            <List>
              {messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  sx={{
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    gap: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={msg.sender === 'support' ? '/support-avatar.png' : undefined}
                    >
                      {msg.sender === 'user' ? 'U' : 'S'}
                    </Avatar>
                  </ListItemAvatar>
                  <Paper
                    sx={{
                      p: 1,
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.sender === 'user' ? 'white' : 'text.primary',
                      maxWidth: '70%',
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {msg.time}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <IconButton color="primary" onClick={handleSend}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
} 