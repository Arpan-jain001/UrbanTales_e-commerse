import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useSellerAuth } from "../context/SellerAuthContext";
import axios from "axios";

export default function SellerNotificationDrawer() {
  const { token } = useSellerAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/seller/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(data || []);
      setUnread((data || []).filter(n => !n.isRead).length);
    };
    if (open) fetchNotifications();
  }, [token, open]);

  const markAllRead = async () => {
    await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/api/seller/notifications/read-all`,
      {}, { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return (
    <>
      <button className="relative" onClick={() => setOpen(o => !o)}>
        <Bell className="w-8 h-8 text-yellow-300" />
        {unread > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs">{unread}</span>}
      </button>
      {open && (
        <div className="fixed top-16 right-6 w-[340px] bg-white border shadow-xl rounded-xl z-50 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold text-[#440077] text-lg">Notifications</span>
            <button className="text-xs text-blue-700 underline" onClick={markAllRead}>
              Mark All Read
            </button>
          </div>
          <div className="p-2">
            {notifications.length === 0 && (
              <div className="py-5 text-center text-gray-400">No notifications.</div>
            )}
            {notifications.map((n, i) => (
              <div key={i} className={`p-3 mb-2 rounded ${n.isRead ? "bg-gray-100" : "bg-yellow-100"}`}>
                <div className="font-semibold text-[#440077]">{n.title || "Update"}</div>
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {n.time ? new Date(n.time).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
