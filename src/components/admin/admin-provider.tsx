"use client";
import { createContext, useContext, useState } from "react";
import { Toaster } from "sonner";
import { MantineProvider, createTheme } from "@mantine/core";
const theme = createTheme({
  primaryColor: "blue",
  primaryShade: 6,
  colors: {
    blue: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
    ],
  },
  fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
    fontWeight: "600",
  },
  defaultRadius: "sm",
  fontSizes: { sm: "0.875rem", md: "0.9375rem" },
  components: {
    Portal: { defaultProps: { target: ".admin-root" } },
    Button: { defaultProps: { fw: 600 } },
    TextInput: { defaultProps: { size: "md" } },
    Textarea: { defaultProps: { size: "md" } },
    Select: { defaultProps: { size: "md" } },
    NumberInput: { defaultProps: { size: "md" } },
  },
});

type Scheme = "light" | "dark";
const AdminAppearance = createContext<{
  scheme: Scheme;
  toggleScheme: () => void;
  collapsed: boolean;
  toggleSidebar: () => void;
} | null>(null);
function preference(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/admin; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}
export function AdminProvider({
  children,
  initialScheme = "light",
  initialCollapsed = false,
}: {
  children: React.ReactNode;
  initialScheme?: Scheme;
  initialCollapsed?: boolean;
}) {
  const [scheme, setScheme] = useState<Scheme>(initialScheme);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const toggleScheme = () => {
    const next = scheme === "light" ? "dark" : "light";
    setScheme(next);
    preference("ua_admin_theme", next);
  };
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    preference("ua_admin_sidebar", collapsed ? "expanded" : "collapsed");
  };
  return (
    <AdminAppearance.Provider
      value={{ scheme, toggleScheme, collapsed, toggleSidebar }}
    >
      <MantineProvider theme={theme} forceColorScheme={scheme}>
        <div className="admin-root" data-admin-theme={scheme}>
          {children}
          <Toaster theme={scheme} position="top-right" richColors closeButton />
        </div>
      </MantineProvider>
    </AdminAppearance.Provider>
  );
}
export function useAdminAppearance() {
  const value = useContext(AdminAppearance);
  if (!value) throw new Error("Admin appearance requires AdminProvider.");
  return value;
}
