import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../services/api';

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const activeNotifs = response.data;
        
        // Filter out dismissed notifications
        const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedNotifications') || '[]');
        const visibleNotifs = activeNotifs.filter(n => !dismissedIds.includes(n._id));
        
        setNotifications(visibleNotifs);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  const handleDismiss = () => {
    const currentNotif = notifications[currentIndex];
    
    // Add to session storage
    const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedNotifications') || '[]');
    sessionStorage.setItem('dismissedNotifications', JSON.stringify([...dismissedIds, currentNotif._id]));
    
    // Remove from local state
    const newNotifs = [...notifications];
    newNotifs.splice(currentIndex, 1);
    setNotifications(newNotifs);
    
    // Adjust index if needed
    if (currentIndex >= newNotifs.length) {
      setCurrentIndex(Math.max(0, newNotifs.length - 1));
    }
  };

  if (notifications.length === 0) return null;

  const currentNotif = notifications[currentIndex];

  return (
    <div className="bg-indigo-600 text-white shadow-md relative mt-16">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="pr-16 sm:text-center sm:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2">
          <p className="font-medium">
            <span className="font-bold mr-2">{currentNotif.title}</span>
            <span className="opacity-90">{currentNotif.body}</span>
          </p>
          
          {notifications.length > 1 && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4 bg-black/10 rounded-full px-2 py-1">
              <button 
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : notifications.length - 1))}
                className="p-0.5 hover:bg-black/20 rounded-full transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold">{currentIndex + 1} of {notifications.length}</span>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev < notifications.length - 1 ? prev + 1 : 0))}
                className="p-0.5 hover:bg-black/20 rounded-full transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex p-2 hover:bg-indigo-500 rounded-md focus:outline-none transition"
          >
            <span className="sr-only">Dismiss</span>
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
