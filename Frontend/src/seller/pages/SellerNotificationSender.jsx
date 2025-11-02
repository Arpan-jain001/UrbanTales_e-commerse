// SellerNotificationSender.jsx
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";

export default function SellerNotificationSender() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const sendNotification = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await axios.post("/api/notifications/send", { message });
      setSuccess("Notification sent!");
      setMessage("");
    } catch {
      setSuccess("Failed to send.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <Box sx={{ my: 3, p: 2, bgcolor: "#fff8", borderRadius: 2 }}>
      <Typography fontWeight={700} color="primary" mb={1}>Send Notification</Typography>
      <TextField
        label="Message" size="small" fullWidth
        value={message}
        onChange={e => setMessage(e.target.value)}
        disabled={loading}
      />
      <Button onClick={sendNotification} sx={{ mt: 2 }} variant="contained" disabled={loading || !message.trim()}>
        Send to All Users
      </Button>
      {success && <Typography color="success.main" mt={1}>{success}</Typography>}
    </Box>
  );
}
