 import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Bell } from 'lucide-react'; // For the notification icon


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Effect to load notifications from localStorage when the component mounts
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('userNotifications')) || [];
      setNotifications(storedNotifications);
      // Update the unread count in localStorage for Navbar
      const unreadCount = storedNotifications.filter(n => !n.isRead).length;
      localStorage.setItem('notificationCount', unreadCount);
    } catch (err) {
      console.error("Failed to load notifications from localStorage:", err);
      setError("Error loading notifications.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount


  // Function to mark a single notification as read
  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    // Update unread count for Navbar
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    localStorage.setItem('notificationCount', unreadCount);
  };


  // Function to mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
    localStorage.setItem('notificationCount', 0); // All are read
  };


  // Helper to format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };


  // Calculate unread count to pass to Navbar
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar notificationCount={unreadNotificationCount} /> {/* Pass the count to Navbar */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Your Notifications</h2>


          {loading && (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          )}


          {error && (
            <div className="text-center py-10 text-red-600">
              <p>{error}</p>
            </div>
          )}


          {!loading && !error && notifications.length === 0 && (
            <div className="text-center py-10 text-gray-600">
              <p>You don't have any notifications yet.</p>
            </div>
          )}


          {!loading && !error && notifications.length > 0 && (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={markAllAsRead}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Mark All as Read
                </button>
              </div>
              <div className="space-y-4">
                {notifications
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start p-4 rounded-lg shadow-sm transition-colors duration-200 ${
                        notif.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-gray-800 border border-blue-200'
                      }`}
                    >
                      <Bell className={`w-5 h-5 mr-3 flex-shrink-0 ${notif.isRead ? 'text-gray-500' : 'text-blue-600'}`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${notif.isRead ? 'text-gray-600' : 'text-blue-800'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="ml-4 flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded-md"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};


export default Notifications;