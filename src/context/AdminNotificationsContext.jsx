import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AdminNotificationsContext = createContext({});

export function AdminNotificationsProvider({ children }) {
  const [pendingTestimonials, setPendingTestimonials] = useState(0);

  useEffect(() => {
    api.get("/admin/testimonials?approved=false")
      .then(res => {
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : [];
        setPendingTestimonials(list.length);
      })
      .catch(() => {});
  }, []);

  const decrementTestimonials = () =>
    setPendingTestimonials(p => Math.max(0, p - 1));

  return (
    <AdminNotificationsContext.Provider value={{ pendingTestimonials, decrementTestimonials }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export const useAdminNotifications = () => useContext(AdminNotificationsContext);