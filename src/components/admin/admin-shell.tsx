"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu as Dropdown, Popover } from "@mantine/core";
import {
  ArrowUpRight,
  Bell,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  House,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Store,
  Sun,
  Tags,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useAdminAppearance } from "./admin-provider";
import { AdminSearch } from "./admin-search";
import type { AdminOverview } from "@/types/admin";
const navigation = [
  { href: "/admin", label: "Dashboard", Icon: House },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", Icon: Boxes },
  { href: "/admin/catalog", label: "Categories & devices", Icon: Tags },
  { href: "/admin/settings", label: "Settings", Icon: Settings2 },
];
const subscribeMobile = (callback: () => void) => {
  const query = window.matchMedia("(max-width: 900px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const mobileSnapshot = () => window.matchMedia("(max-width: 900px)").matches;
function AttentionMenu() {
  const [opened, setOpened] = useState(false);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const open = async (value: boolean) => {
    setOpened(value);
    if (!value) return;
    setError("");
    try {
      setData(await adminApi<AdminOverview>("/admin/overview"));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load notifications.",
      );
    }
  };
  const total = data
    ? data.pendingApproval + data.paymentVerification + data.lowStock
    : 0;
  return (
    <Popover
      opened={opened}
      onChange={open}
      position="bottom-end"
      width={300}
      shadow="md"
    >
      <Popover.Target>
        <button
          className="neu-round-button neu-notifications"
          aria-label="Store notifications"
          aria-expanded={opened}
          onClick={() => open(!opened)}
        >
          <Bell size={22} />
          {total > 0 && <i />}
        </button>
      </Popover.Target>
      <Popover.Dropdown className="neu-popover">
        <h3>Needs your attention</h3>
        {error ? (
          <p role="alert">{error}</p>
        ) : !data ? (
          <p>Loading store updates…</p>
        ) : (
          <div className="neu-notification-links">
            {[
              {
                label: "Orders awaiting approval",
                count: data.pendingApproval,
                href: "/admin/orders?status=AWAITING_APPROVAL",
              },
              {
                label: "UPI payments to verify",
                count: data.paymentVerification,
                href: "/admin/orders?paymentStatus=PENDING_VERIFICATION",
              },
              {
                label: "Low-stock variants",
                count: data.lowStock,
                href: "/admin/inventory?lowStock=true",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpened(false)}
              >
                <span>{item.label}</span>
                <b>{item.count}</b>
                <ChevronRight size={15} />
              </Link>
            ))}
          </div>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const query = useSearchParams();
  const appearance = useAdminAppearance();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const mobile = useSyncExternalStore(
    subscribeMobile,
    mobileSnapshot,
    () => false,
  );
  const drawerOpen = mobile && mobileOpen;
  const panel = useRef<HTMLElement>(null);
  useFocusTrap(panel, drawerOpen);
  const section =
    navigation.find(
      (item) => item.href !== "/admin" && pathname.startsWith(item.href),
    )?.label ?? "Dashboard";
  const dashboard = pathname === "/admin";
  const selectedDays = ["7", "30", "180", "365"].includes(
    query.get("days") ?? "",
  )
    ? Number(query.get("days"))
    : 30;
  const today = new Date();
  const format = (date: Date) =>
    date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);
  async function signOut() {
    setSigningOut(true);
    try {
      await adminApi("/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign out.");
      setSigningOut(false);
    }
  }
  return (
    <div
      className={`ad-workspace neu-workspace ${appearance.collapsed && !mobile ? "is-collapsed" : ""}`}
    >
      <a className="ad-skip" href="#admin-main">
        Skip to content
      </a>
      {drawerOpen && (
        <button
          className="ad-drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={panel}
        className={`ad-sidebar ${mobileOpen ? "is-open" : ""}`}
        aria-label="Admin navigation"
        inert={mobile && !drawerOpen}
        role={drawerOpen ? "dialog" : undefined}
        aria-modal={drawerOpen || undefined}
      >
        <div className="neu-sidebar-brand">
          <Link
            href="/admin"
            className="ad-brand"
            aria-label="Unique Accessories dashboard"
            onClick={() => setMobileOpen(false)}
          >
            <span className="neu-bag-logo">
              <ShoppingBag size={27} strokeWidth={1.8} />
              <i />
            </span>
            <span className="neu-brand-copy">
              <strong>Unique Accessories</strong>
              <small>Store workspace</small>
            </span>
          </Link>
          <button
            className="neu-collapse-button"
            aria-label={
              appearance.collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            onClick={appearance.toggleSidebar}
          >
            {appearance.collapsed ? (
              <ChevronsRight size={17} />
            ) : (
              <ChevronsLeft size={17} />
            )}
          </button>
          <button
            className="ad-mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="neu-primary-nav">
          {navigation.map(({ href, label, Icon }) => {
            const active =
              href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={appearance.collapsed ? label : undefined}
                className={`ad-nav-link ${active ? "is-active" : ""} ${href === "/admin/products" || href === "/admin/orders" ? "is-raised" : ""}`}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                onClick={() => setMobileOpen(false)}
              >
                <span className="neu-nav-icon">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="neu-nav-label">{label}</span>
                {(href === "/admin/products" || href === "/admin/orders") && (
                  <ChevronRight size={16} className="neu-nav-chevron" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="neu-channels">
          <p className="ad-nav-caption">SALES CHANNEL</p>
          <Link
            href="/"
            className="ad-nav-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View storefront"
            title="View storefront"
          >
            <span className="neu-nav-icon">
              <Store size={22} />
            </span>
            <span className="neu-nav-label">Online store</span>
            <ArrowUpRight size={14} className="neu-nav-chevron" />
          </Link>
        </div>
        <div className="ad-sidebar-bottom">
          <button
            className="neu-sidebar-theme"
            onClick={appearance.toggleScheme}
            aria-label={`Switch to ${appearance.scheme === "light" ? "dark" : "light"} theme`}
          >
            {appearance.scheme === "light" ? (
              <Moon size={17} />
            ) : (
              <Sun size={17} />
            )}
            <span>
              {appearance.scheme === "light"
                ? "Dark appearance"
                : "Light appearance"}
            </span>
          </button>
        </div>
      </aside>
      <div className="ad-main-column">
        <header className="ad-topbar neu-header">
          <div className="neu-welcome">
            <button
              className="ad-icon-button ad-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              {dashboard ? (
                <>
                  <h1>Dashboard </h1>
                  <p>Your store performance at a glance.</p>
                </>
              ) : (
                <>
                  <div className="neu-breadcrumb">
                    Workspace <ChevronRight size={14} /> {section}
                  </div>
                  <p>Unique Accessories administration</p>
                </>
              )}
            </div>
          </div>
          <div className="neu-header-controls">
            <div className="neu-header-tools">
              <button
                className="neu-search-trigger"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={19} />
                <span>Search products, orders, customers…</span>
                <kbd>⌘ K</kbd>
              </button>
              <button
                className="neu-round-button neu-header-theme"
                aria-label={`Switch to ${appearance.scheme === "light" ? "dark" : "light"} theme`}
                onClick={appearance.toggleScheme}
              >
                {appearance.scheme === "light" ? (
                  <Moon size={19} />
                ) : (
                  <Sun size={19} />
                )}
              </button>
              <AttentionMenu />
              <Dropdown position="bottom-end" shadow="md" width={220}>
                <Dropdown.Target>
                  <button className="neu-profile" aria-label="Account menu">
                    <span className="neu-owner-avatar">
                      {email.charAt(0).toUpperCase()}
                    </span>
                    <span className="neu-profile-copy">
                      <strong>Store administrator</strong>
                      <small>Store owner</small>
                    </span>
                    <ChevronDown size={17} />
                  </button>
                </Dropdown.Target>
                <Dropdown.Dropdown className="neu-popover">
                  <Dropdown.Label>{email}</Dropdown.Label>
                  <Dropdown.Item
                    component={Link}
                    href="/admin/settings"
                    leftSection={<Settings2 size={15} />}
                  >
                    Store settings
                  </Dropdown.Item>
                  <Dropdown.Item
                    leftSection={<LogOut size={15} />}
                    onClick={signOut}
                    disabled={signingOut}
                    color="red"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </Dropdown.Item>
                </Dropdown.Dropdown>
              </Dropdown>
            </div>
            {dashboard && (
              <Dropdown position="bottom-end" shadow="md">
                <Dropdown.Target>
                  <button className="neu-date-control">
                    <CalendarDays size={15} />
                    <span>
                      {format(
                        new Date(
                          today.getTime() - (selectedDays - 1) * 86400000,
                        ),
                      )}{" "}
                      – {format(today)}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                </Dropdown.Target>
                <Dropdown.Dropdown className="neu-popover">
                  {[
                    { days: 7, label: "Last 7 days" },
                    { days: 30, label: "Last 30 days" },
                    { days: 180, label: "Last 6 months" },
                    { days: 365, label: "Last year" },
                  ].map((item) => (
                    <Dropdown.Item
                      key={item.days}
                      component={Link}
                      href={`/admin?days=${item.days}`}
                      aria-current={
                        selectedDays === item.days ? "true" : undefined
                      }
                    >
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Dropdown>
              </Dropdown>
            )}
          </div>
        </header>
        <main id="admin-main" className="ad-content" tabIndex={-1}>
          {error && (
            <div role="alert" className="ad-alert ad-alert--error">
              {error}
              <button onClick={() => setError("")}>Dismiss</button>
            </div>
          )}
          {children}
        </main>
      </div>
      <AdminSearch opened={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
