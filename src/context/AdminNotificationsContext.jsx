import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AdminNotificationsContext = createContext({});

export function AdminNotificationsProvider({ children }) {
  const [pendingTestimonials, setPendingTestimonials] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    api.get("/admin/testimonials?approved=false")
      .then(res => {
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : [];
        setPendingTestimonials(list.length);
      })
      .catch(() => {});

    api.get("/admin/contact-messages/unread-count")
      .then(res => {
        setUnreadMessages(res.data?.data?.count ?? 0);
      })
      .catch(() => {});
  }, []);

  const decrementTestimonials = () =>
    setPendingTestimonials(p => Math.max(0, p - 1));

  const decrementMessages = () =>
    setUnreadMessages(p => Math.max(0, p - 1));

  const refreshUnreadMessages = () => {
    api.get("/admin/contact-messages/unread-count")
      .then(res => setUnreadMessages(res.data?.data?.count ?? 0))
      .catch(() => {});
  };

  return (
    <AdminNotificationsContext.Provider value={{
      pendingTestimonials,
      decrementTestimonials,
      unreadMessages,
      decrementMessages,
      refreshUnreadMessages,
    }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export const useAdminNotifications = () => useContext(AdminNotificationsContext);