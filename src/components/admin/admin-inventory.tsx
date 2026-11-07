"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUnsavedChanges } from "@/lib/use-unsaved-changes";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  NativeSelect,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Boxes, History, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { adjustmentSchema } from "@/lib/validation/catalog";
import { adminApi } from "@/lib/admin-api";
import type {
  InventoryList,
  InventoryRow,
  StockMovement,
} from "@/types/catalog-admin";
import { AdminPageHeading } from "./admin-ui";
import { AdminRefresh } from "./admin-refresh";
export function AdminInventory({
  data,
  query,
}: {
  data: InventoryList;
  query: { q: string; lowStock: string; threshold: string };
}) {
  const router = useRouter();
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<InventoryRow | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [movements, setMovements] = useState<{
    items: StockMovement[];
    total: number;
  } | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [baselines, setBaselines] = useState<
    Record<string, { version: number; quantity: number }>
  >({});
  const key = useRef({ payload: "", id: "" });
  const changed = data.items.filter((v) => deltas[v.id]);
  useUnsavedChanges(changed.length > 0);
  useEffect(() => {
    if (!history) return;
    let active = true;
    const controller = new AbortController();
    adminApi<{ items: StockMovement[]; total: number }>(
      `/admin/inventory/${history.id}/history?page=${historyPage}`,
      { signal: controller.signal },
    )
      .then((value) => {
        if (active) setMovements(value);
      })
      .catch((e) => {
        if (active) setHistoryError(e.message);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [history, historyPage]);
  async function save() {
    setError("");
    const payload = {
      reason,
      items: changed.map((v) => ({
        variantId: v.id,
        version: baselines[v.id]?.version ?? 0,
        delta: deltas[v.id],
      })),
    };
    const serialized = JSON.stringify(payload);
    if (key.current.payload !== serialized)
      key.current = { payload: serialized, id: crypto.randomUUID() };
    const parsed = adjustmentSchema.safeParse({
      ...payload,
      idempotencyKey: key.current.id,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(" "));
      return;
    }
    setBusy(true);
    try {
      await adminApi("/admin/inventory/adjust", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setDeltas({});
      setBaselines({});
      setReason("");
      setOpened(false);
      key.current = { payload: "", id: "" };
      toast.success(
        `Stock updated for ${changed.length} variant${changed.length === 1 ? "" : "s"}`,
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not adjust stock.");
    } finally {
      setBusy(false);
    }
  }
  const href = (page: number) =>
    `/admin/inventory?${new URLSearchParams({ ...query, page: String(page) })}`;
  return (
    <>
      <AdminPageHeading
        eyebrow="CATALOG / STOCK"
        title="Inventory"
        description="Know what’s available. Keep every stock change accounted for."
      >
        <AdminRefresh disabled={changed.length > 0} />
        {changed.length > 0 && (
          <Button
            variant="default"
            disabled={busy}
            onClick={() => {
              setDeltas({});
              setBaselines({});
              setReason("");
              key.current = { payload: "", id: "" };
              router.refresh();
            }}
          >
            Discard changes
          </Button>
        )}
        <Button
          leftSection={<Save size={16} />}
          disabled={!changed.length}
          onClick={() => {
            setError("");
            setOpened(true);
          }}
        >
          Review {changed.length || ""} adjustment
          {changed.length === 1 ? "" : "s"}
        </Button>
      </AdminPageHeading>
      <section className="ad-editor-card">
        <form action="/admin/inventory" className="ad-catalog-toolbar">
          <TextInput
            name="q"
            aria-label="Search inventory"
            placeholder="Search product or SKU"
            leftSection={<Search size={16} />}
            defaultValue={query.q}
            maxLength={100}
          />
          <NumberInput
            name="threshold"
            aria-label="Low stock threshold"
            min={0}
            max={10000}
            allowDecimal={false}
            defaultValue={Number(query.threshold)}
            style={{ width: 120 }}
          />
          <NativeSelect
            name="lowStock"
            aria-label="Stock filter"
            defaultValue={query.lowStock}
            data={[
              { value: "false", label: "All inventory" },
              { value: "true", label: "Low stock only" },
            ]}
          />
          <Button
            variant="default"
            type="submit"
            disabled={Boolean(changed.length)}
          >
            Filter
          </Button>
        </form>
        <Group mt="md" gap="xs">
          <Badge variant="light" color="orange">
            {data.lowStockCount} low stock
          </Badge>
          <Text size="xs" c="dimmed">
            Threshold: {query.threshold} units. Enter + to add stock or − to
            remove stock.
          </Text>
        </Group>
      </section>
      {changed.length > 0 && (
        <Alert color="blue" mt="md">
          {changed.length} unsaved adjustments on this page. Review and save
          them before filtering or changing pages.
        </Alert>
      )}
      <section className="ad-card" style={{ marginTop: 20 }}>
        {data.items.length ? (
          <div className="ad-table-wrap">
            <table className="ad-product-table">
              <thead>
                <tr>
                  <th>Product / variant</th>
                  <th>On hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Adjustment</th>
                  <th>
                    <span className="ad-sr-only">History</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link
                        className="ad-inline-link"
                        href={`/admin/products/${v.product.id}`}
                      >
                        {v.product.name}
                      </Link>
                      <Text size="xs" c="dimmed" mt={3}>
                        {v.sku} ·{" "}
                        {[v.color, v.material, v.capacity]
                          .filter(Boolean)
                          .join(" / ") || "Standard"}
                        {!v.isActive ? " · Disabled" : ""}
                        {v.product.status === "ARCHIVED" ? " · Archived" : ""}
                      </Text>
                    </td>
                    <td>{v.inventory?.quantity ?? 0}</td>
                    <td>{v.inventory?.reserved ?? 0}</td>
                    <td>
                      <Text
                        size="sm"
                        fw={600}
                        c={
                          v.available === 0
                            ? "red"
                            : v.available <= Number(query.threshold)
                              ? "orange"
                              : undefined
                        }
                      >
                        {v.available}
                      </Text>
                    </td>
                    <td>
                      <NumberInput
                        aria-label={`Stock adjustment for ${v.sku}`}
                        value={deltas[v.id] ?? ""}
                        onChange={(n) => {
                          if (!deltas[v.id] && v.inventory) {
                            const baseline = {
                              version: v.inventory.version,
                              quantity: v.inventory.quantity,
                            };
                            setBaselines((previous) => ({
                              ...previous,
                              [v.id]: baseline,
                            }));
                          }
                          setDeltas({
                            ...deltas,
                            [v.id]: typeof n === "number" ? n : 0,
                          });
                        }}
                        allowDecimal={false}
                        min={
                          -(v.inventory?.quantity ?? 0) +
                          (v.inventory?.reserved ?? 0)
                        }
                        max={1000000 - (v.inventory?.quantity ?? 0)}
                        className="ad-stock-delta"
                        size="sm"
                        disabled={!v.inventory || busy}
                      />
                      {deltas[v.id] ? (
                        <Text size="xs" c="blue" mt={3}>
                          New on hand:{" "}
                          {(baselines[v.id]?.quantity ??
                            v.inventory?.quantity ??
                            0) + deltas[v.id]}
                        </Text>
                      ) : null}
                    </td>
                    <td>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<History size={14} />}
                        onClick={() => {
                          setMovements(null);
                          setHistoryError("");
                          setHistoryPage(1);
                          setHistory(v);
                        }}
                      >
                        History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ad-catalog-empty">
            <Boxes size={32} />
            <strong>No inventory matches these filters</strong>
            <p>Try another product name, SKU or stock filter.</p>
          </div>
        )}
        <div className="ad-catalog-pagination">
          <Text size="sm" c="dimmed">
            {data.total} variants · Page {data.page} of {data.pages}
          </Text>
          <Group gap="xs">
            <Button
              component={Link}
              href={href(Math.max(1, data.page - 1))}
              disabled={data.page === 1 || Boolean(changed.length)}
              variant="default"
              size="xs"
            >
              Previous
            </Button>
            <Button
              component={Link}
              href={href(Math.min(data.pages, data.page + 1))}
              disabled={data.page === data.pages || Boolean(changed.length)}
              variant="default"
              size="xs"
            >
              Next
            </Button>
          </Group>
        </div>
      </section>
      <Modal
        closeButtonProps={{ "aria-label": "Close dialog" }}
        opened={opened}
        onClose={() => !busy && setOpened(false)}
        title="Review stock adjustments"
        centered
        size="lg"
      >
        <Stack>
          {error && (
            <Alert color="red" role="alert">
              {error}
            </Alert>
          )}
          <Text size="sm" c="dimmed">
            All adjustments save together. Stock changed by an order or another
            session must be reviewed again.
          </Text>
          {changed.map((v) => (
            <Group key={v.id} justify="space-between">
              <div>
                <Text size="sm" fw={600}>
                  {v.product.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {v.sku}
                </Text>
              </div>
              <Text size="sm">
                {v.inventory?.quantity ?? 0} →{" "}
                {(baselines[v.id]?.quantity ?? v.inventory?.quantity ?? 0) +
                  deltas[v.id]}{" "}
                ({deltas[v.id] > 0 ? "+" : ""}
                {deltas[v.id]})
              </Text>
            </Group>
          ))}
          <Textarea
            label="Reason for adjustment"
            required
            placeholder="e.g. Received stock from supplier"
            minRows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            description="At least 5 characters. This reason is saved in stock history."
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={busy}
              onClick={() => setOpened(false)}
            >
              Keep editing
            </Button>
            <Button loading={busy} onClick={save}>
              Save adjustments
            </Button>
          </Group>
          {error.includes("Stock changed") && (
            <Button
              variant="light"
              onClick={() => {
                setDeltas({});
                setBaselines({});
                setOpened(false);
                router.refresh();
              }}
            >
              Discard adjustments and refresh stock
            </Button>
          )}
        </Stack>
      </Modal>
      <Modal
        closeButtonProps={{ "aria-label": "Close dialog" }}
        opened={Boolean(history)}
        onClose={() => setHistory(null)}
        title={`Stock history · ${history?.sku ?? ""}`}
        centered
        size="lg"
      >
        <Stack>
          {historyError ? (
            <Alert color="red">{historyError}</Alert>
          ) : !movements ? (
            <Text size="sm">Loading stock history…</Text>
          ) : movements.items.length ? (
            <>
              {movements.items.map((m) => (
                <div
                  key={m.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: 14,
                  }}
                >
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>
                      {m.delta > 0 ? "+" : ""}
                      {m.delta} units
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(m.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </Text>
                  </Group>
                  <Text size="sm" mt={5}>
                    {m.reason}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {m.quantityBefore} → {m.quantityAfter} · {m.actor}
                  </Text>
                  {m.orderReference && (
                    <Link
                      className="ad-inline-link"
                      href={`/admin/orders/${m.orderReference}`}
                    >
                      {m.orderReference}
                    </Link>
                  )}
                </div>
              ))}
              <Group justify="space-between">
                <Button
                  variant="default"
                  size="xs"
                  disabled={historyPage === 1}
                  onClick={() => {
                    setMovements(null);
                    setHistoryPage(historyPage - 1);
                  }}
                >
                  Previous
                </Button>
                <Text size="xs">Page {historyPage}</Text>
                <Button
                  variant="default"
                  size="xs"
                  disabled={historyPage * 30 >= movements.total}
                  onClick={() => {
                    setMovements(null);
                    setHistoryPage(historyPage + 1);
                  }}
                >
                  Next
                </Button>
              </Group>
            </>
          ) : (
            <Text size="sm" c="dimmed">
              No recorded stock changes yet. Existing seed quantities predate
              stock history.
            </Text>
          )}
        </Stack>
      </Modal>
    </>
  );
}
