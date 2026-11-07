"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import type { Taxonomy } from "@/types/catalog-admin";
import { taxonomySchemas } from "@/lib/validation/catalog";
import { adminApi } from "@/lib/admin-api";
import { AdminPageHeading } from "./admin-ui";
type Kind = keyof typeof taxonomySchemas;
const labels = {
  categories: "Categories",
  subcategories: "Subcategories",
  brands: "Brands",
  deviceModels: "Device models",
};
const singular = {
  categories: "category",
  subcategories: "subcategory",
  brands: "brand",
  deviceModels: "device model",
};
interface Entry {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  categoryId?: string;
  brandId?: string;
  type?: string;
}
export function AdminTaxonomy({ taxonomy }: { taxonomy: Taxonomy }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("categories");
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [deleting, setDeleting] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const form = useForm<Record<string, string>>({
    initialValues: {},
    validate: (values) =>
      schemaResolver(taxonomySchemas[kind], { sync: true })(values),
  });
  function edit(entry: Entry | "new") {
    setError("");
    setEditing(entry);
    let data: Record<string, string> = {
      name: entry === "new" ? "" : entry.name,
    };
    if (kind === "categories" || kind === "subcategories")
      data = {
        ...data,
        slug: entry === "new" ? "" : (entry.slug ?? ""),
        description: entry === "new" ? "" : (entry.description ?? ""),
        icon: entry === "new" ? "Package" : (entry.icon ?? "Package"),
      };
    if (kind === "subcategories")
      data.categoryId = entry === "new" ? "" : (entry.categoryId ?? "");
    if (kind === "brands" || kind === "deviceModels")
      data.type = entry === "new" ? "PHONE" : (entry.type ?? "PHONE");
    if (kind === "deviceModels")
      data.brandId = entry === "new" ? "" : (entry.brandId ?? "");
    form.setValues(data); // Clear fields left over from a different taxonomy kind.
    form.setInitialValues(data);
    form.reset();
    form.clearErrors();
  }
  async function save(data: Record<string, string>) {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const parsed = taxonomySchemas[kind].parse(data);
      await adminApi(
        `/admin/catalog/${kind}${editing === "new" ? "" : `/${editing.id}`}`,
        {
          method: editing === "new" ? "POST" : "PATCH",
          body: JSON.stringify(parsed),
        },
      );
      setEditing(null);
      toast.success(`${labels[kind]} updated`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save entry.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await adminApi(`/admin/catalog/${kind}/${deleting.id}`, {
        method: "DELETE",
      });
      setDeleting(null);
      toast.success("Entry deleted");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete entry.");
    } finally {
      setBusy(false);
    }
  }
  const rows = (taxonomy[kind] as Entry[]).filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <AdminPageHeading
        eyebrow="CATALOG / ORGANIZATION"
        title="Categories & devices"
        description="Organize your collection and keep device compatibility up to date."
      >
        <Button leftSection={<Plus size={16} />} onClick={() => edit("new")}>
          Add {singular[kind]}
        </Button>
      </AdminPageHeading>
      <Tabs
        value={kind}
        onChange={(value) => {
          setKind(value as Kind);
          setQuery("");
        }}
        mb="xl"
        className="ad-taxonomy-tabs"
      >
        <Tabs.List>
          {Object.entries(labels).map(([value, label]) => (
            <Tabs.Tab key={value} value={value}>
              {label} ({taxonomy[value as Kind].length})
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <section className="ad-card">
        <div style={{ padding: 20 }}>
          <TextInput
            aria-label={`Search ${labels[kind].toLowerCase()}`}
            placeholder={`Search ${labels[kind].toLowerCase()}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {rows.length ? (
          <div className="ad-table-wrap">
            <table className="ad-product-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>
                    {kind === "categories" || kind === "subcategories"
                      ? "Slug"
                      : "Device type"}
                  </th>
                  <th>
                    {kind === "subcategories"
                      ? "Category"
                      : kind === "deviceModels"
                        ? "Brand"
                        : "Details"}
                  </th>
                  <th>
                    <span className="ad-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <Text size="sm" fw={600}>
                        {entry.name}
                      </Text>
                    </td>
                    <td>{entry.slug ?? entry.type}</td>
                    <td>
                      <Text size="sm" c="dimmed">
                        {kind === "subcategories"
                          ? taxonomy.categories.find(
                              (c) => c.id === entry.categoryId,
                            )?.name
                          : kind === "deviceModels"
                            ? taxonomy.brands.find(
                                (b) => b.id === entry.brandId,
                              )?.name
                            : entry.description || "—"}
                      </Text>
                    </td>
                    <td>
                      <Group gap="xs" wrap="nowrap">
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          onClick={() => edit(entry)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="subtle"
                          color="red"
                          size="compact-xs"
                          onClick={() => {
                            setError("");
                            setDeleting(entry);
                          }}
                        >
                          Delete
                        </Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ad-catalog-empty">
            <Tags size={28} />
            <Text>No entries found.</Text>
          </div>
        )}
      </section>
      <Modal
        closeButtonProps={{ "aria-label": "Close dialog" }}
        opened={Boolean(editing)}
        onClose={() => !busy && setEditing(null)}
        title={`${editing === "new" ? "Add" : "Edit"} ${singular[kind]}`}
        centered
      >
        <form onSubmit={form.onSubmit(save)} noValidate>
          <Stack>
            {error && (
              <Alert color="red" role="alert">
                {error}
              </Alert>
            )}
            <TextInput
              label="Name"
              required
              maxLength={100}
              {...form.getInputProps("name")}
            />
            {(kind === "categories" || kind === "subcategories") && (
              <>
                <TextInput
                  label="Slug"
                  required
                  description="Lowercase words separated by hyphens."
                  maxLength={100}
                  {...form.getInputProps("slug")}
                />
                <Textarea
                  label="Description"
                  maxLength={500}
                  {...form.getInputProps("description")}
                />
              </>
            )}
            {kind === "subcategories" && (
              <Select
                label="Category"
                searchable
                required
                data={taxonomy.categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                {...form.getInputProps("categoryId")}
              />
            )}
            {(kind === "brands" || kind === "deviceModels") && (
              <Select
                label="Device type"
                required
                data={[
                  { value: "PHONE", label: "Phone" },
                  { value: "CAR", label: "Car" },
                ]}
                {...form.getInputProps("type")}
                onChange={(type) => {
                  form.setFieldValue("type", type ?? "PHONE");
                  if (kind === "deviceModels")
                    form.setFieldValue("brandId", "");
                }}
              />
            )}
            {kind === "deviceModels" && (
              <Select
                label="Brand"
                searchable
                required
                data={taxonomy.brands
                  .filter((b) => b.type === form.values.type)
                  .map((b) => ({ value: b.id, label: b.name }))}
                {...form.getInputProps("brandId")}
              />
            )}
            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                Save {singular[kind]}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal
        closeButtonProps={{ "aria-label": "Close dialog" }}
        opened={Boolean(deleting)}
        onClose={() => !busy && setDeleting(null)}
        title={`Delete ${singular[kind]}?`}
        centered
      >
        <Stack>
          {error && (
            <Alert color="red" role="alert">
              {error}
            </Alert>
          )}
          <Text size="sm">
            Delete “{deleting?.name}”? Entries used by products, models, or
            subcategories must have those references removed first.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Keep entry
            </Button>
            <Button color="red" loading={busy} onClick={remove}>
              Delete entry
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
