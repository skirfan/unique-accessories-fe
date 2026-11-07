"use client";
import { useState } from "react";
import Link from "next/link";
import { useUnsavedChanges } from "@/lib/use-unsaved-changes";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  MultiSelect,
  NativeSelect,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { ArrowLeft, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { productSchema } from "@/lib/validation/catalog";
import { adminApi } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import type {
  AdminProduct,
  ProductInput,
  Taxonomy,
} from "@/types/catalog-admin";
import { AdminPageHeading } from "./admin-ui";
import { ProductStatus } from "./admin-products";
import { AdminProductImages } from "./admin-product-images";
const newVariant = () => ({
  sku: "",
  color: "",
  colorHex: "",
  material: "",
  capacity: "",
  price: 0,
  compareAt: null as number | null,
  isActive: true,
  initialStock: 0,
});
function values(p: AdminProduct | undefined): ProductInput {
  return p
    ? {
        name: p.name,
        slug: p.slug,
        subcategoryId: p.subcategoryId,
        shortDescription: p.shortDescription,
        description: p.description,
        features: p.features,
        status: p.status,
        badge: p.badge,
        compatibleDeviceModelIds: p.compatibleDeviceModelIds,
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          color: v.color ?? "",
          colorHex: v.colorHex ?? "",
          material: v.material ?? "",
          capacity: v.capacity ?? "",
          price: v.price,
          compareAt: v.compareAt,
          isActive: v.isActive,
          initialStock: 0,
        })),
      }
    : {
        name: "",
        slug: "",
        subcategoryId: "",
        shortDescription: "",
        description: "",
        features: [],
        status: "DRAFT",
        badge: null,
        compatibleDeviceModelIds: [],
        variants: [newVariant()],
      };
}
export function AdminProductEditor({
  initial,
  taxonomy,
}: {
  initial?: AdminProduct;
  taxonomy: Taxonomy;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [tab, setTab] = useState<string | null>("details");
  const [photoDirty, setPhotoDirty] = useState(false);
  const form = useForm<ProductInput>({
    initialValues: values(initial),
    validate: schemaResolver(productSchema, { sync: true }),
    validateInputOnBlur: true,
  });
  const dirty = form.isDirty();
  useUnsavedChanges(dirty);
  async function save(data: ProductInput) {
    setBusy(true);
    setError("");
    setConflict(false);
    try {
      const payload = productSchema.parse(data);
      const saved = await adminApi<AdminProduct>(
        current ? `/admin/products/${current.id}` : "/admin/products",
        {
          method: current ? "PATCH" : "POST",
          body: JSON.stringify({
            ...payload,
            ...(current ? { version: current.version } : {}),
          }),
        },
      );
      setCurrent(saved);
      form.setValues(values(saved));
      form.resetDirty(values(saved));
      toast.success(current ? "Product updated" : "Product created");
      if (!current) router.replace(`/admin/products/${saved.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save product.");
      if (e instanceof ApiError) {
        setConflict(e.status === 409);
        if (e.issues)
          form.setErrors(
            Object.fromEntries(e.issues.map((i) => [i.path, i.message])),
          );
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeading
        eyebrow="CATALOG / PRODUCTS"
        title={current ? current.name : "Add a product"}
        description="The details that help customers choose with confidence."
      >
        <Button
          component={Link}
          href="/admin/products"
          variant="default"
          leftSection={<ArrowLeft size={15} />}
        >
          Products
        </Button>
        {current?.status === "PUBLISHED" && (
          <Button
            component={Link}
            target="_blank"
            href={`/product/${current.slug}`}
            variant="subtle"
            rightSection={<ExternalLink size={14} />}
          >
            View in store
          </Button>
        )}
      </AdminPageHeading>
      <Tabs
        value={tab}
        onChange={(value) => {
          if (
            tab === "photos" &&
            photoDirty &&
            value !== tab &&
            !window.confirm("Discard unsaved photo changes?")
          )
            return;
          setPhotoDirty(false);
          setTab(value);
        }}
        mb="xl"
      >
        <Tabs.List>
          <Tabs.Tab value="details">Product details</Tabs.Tab>
          <Tabs.Tab value="photos" disabled={!current}>
            Photos {current && `(${current.images.length})`}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {tab === "photos" && current ? (
        <AdminProductImages
          product={current}
          dirty={dirty}
          onSaved={setCurrent}
          onDirtyChange={setPhotoDirty}
        />
      ) : (
        <form
          onSubmit={form.onSubmit(save, () => {
            setError("Please correct the highlighted fields before saving.");
          })}
          noValidate
          className="ad-catalog-stack"
        >
          {error && (
            <Alert color="red" title="Product could not be saved" role="alert">
              {error}
              {conflict && (
                <Button
                  size="xs"
                  variant="light"
                  mt="sm"
                  onClick={() => window.location.reload()}
                >
                  Reload latest version
                </Button>
              )}
            </Alert>
          )}
          <div className="ad-catalog-grid">
            <div className="ad-catalog-stack">
              <section className="ad-editor-card">
                <h2>Product information</h2>
                <p className="ad-card-description">
                  Clear names and useful details make your catalog easier to
                  shop.
                </p>
                <Stack gap="md">
                  <TextInput
                    label="Product name"
                    placeholder="e.g. MagSafe clear case"
                    required
                    maxLength={160}
                    {...form.getInputProps("name")}
                  />
                  <TextInput
                    label="URL slug"
                    placeholder="magsafe-clear-case"
                    description="A unique address for this product. Changing it changes the storefront URL."
                    required
                    maxLength={180}
                    {...form.getInputProps("slug")}
                    rightSectionWidth={105}
                    rightSection={
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        onClick={() =>
                          form.setFieldValue(
                            "slug",
                            form.values.name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-|-$/g, "")
                              .slice(0, 180),
                          )
                        }
                      >
                        Generate
                      </Button>
                    }
                  />
                  <Textarea
                    label="Short description"
                    description="Shown on product cards and search previews. 10–300 characters."
                    required
                    minRows={2}
                    maxLength={300}
                    {...form.getInputProps("shortDescription")}
                  />
                  <Textarea
                    label="Full description"
                    required
                    minRows={5}
                    maxLength={20000}
                    {...form.getInputProps("description")}
                  />
                  <TagsInput
                    label="Features & specifications"
                    description="Type a feature and press Enter. Up to 30 features."
                    maxTags={30}
                    {...form.getInputProps("features")}
                  />
                </Stack>
              </section>
              <section className="ad-editor-card">
                <Group justify="space-between" mb="lg">
                  <div>
                    <h2>Variants</h2>
                    <Text size="sm" c="dimmed">
                      Each option has its own SKU, price, and stock.
                    </Text>
                  </div>
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<Plus size={14} />}
                    onClick={() =>
                      form.insertListItem("variants", newVariant())
                    }
                    disabled={form.values.variants.length >= 100}
                  >
                    Add variant
                  </Button>
                </Group>
                {typeof form.errors.variants === "string" && (
                  <Alert color="red" mb="md">
                    {form.errors.variants}
                  </Alert>
                )}
                {form.values.variants.map((v, index) => {
                  const prefix = `variants.${index}`;
                  const stock = current?.variants.find(
                    (row) => row.id === v.id,
                  )?.inventory;
                  return (
                    <div
                      className="ad-variant-card"
                      key={v.id ?? `new-${index}`}
                    >
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Text fw={600} size="sm">
                            Variant {index + 1}
                          </Text>
                          {v.id && (
                            <Badge color="gray" variant="light" size="sm">
                              {Math.max(
                                0,
                                (stock?.quantity ?? 0) - (stock?.reserved ?? 0),
                              )}{" "}
                              available
                            </Badge>
                          )}
                        </Group>
                        {!v.id && form.values.variants.length > 1 ? (
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            color="red"
                            leftSection={<Trash2 size={13} />}
                            onClick={() =>
                              form.removeListItem("variants", index)
                            }
                          >
                            Remove
                          </Button>
                        ) : null}
                      </Group>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                          label="SKU"
                          required
                          maxLength={80}
                          {...form.getInputProps(`${prefix}.sku`)}
                        />
                        <TextInput
                          label="Colour"
                          placeholder="e.g. Midnight blue"
                          maxLength={100}
                          {...form.getInputProps(`${prefix}.color`)}
                        />
                        <TextInput
                          label="Colour hex"
                          placeholder="#172033"
                          maxLength={7}
                          {...form.getInputProps(`${prefix}.colorHex`)}
                        />
                        <TextInput
                          label="Material"
                          placeholder="e.g. Silicone"
                          maxLength={100}
                          {...form.getInputProps(`${prefix}.material`)}
                        />
                        <TextInput
                          label="Capacity / size"
                          placeholder="e.g. 10,000 mAh"
                          maxLength={100}
                          {...form.getInputProps(`${prefix}.capacity`)}
                        />
                        <NumberInput
                          label="Selling price (₹)"
                          required
                          min={0.01}
                          max={1000000}
                          decimalScale={2}
                          {...form.getInputProps(`${prefix}.price`)}
                        />
                        <NumberInput
                          label="Compare-at price (₹)"
                          description="Optional. Must exceed selling price."
                          min={0.01}
                          max={1000000}
                          decimalScale={2}
                          value={v.compareAt ?? ""}
                          onChange={(n) =>
                            form.setFieldValue(
                              `${prefix}.compareAt`,
                              typeof n === "number" ? n : null,
                            )
                          }
                          error={form.errors[`${prefix}.compareAt`]}
                        />
                        {!v.id ? (
                          <NumberInput
                            label="Opening stock"
                            min={0}
                            max={1000000}
                            allowDecimal={false}
                            {...form.getInputProps(`${prefix}.initialStock`)}
                          />
                        ) : (
                          <div>
                            <Text size="sm" mt={4}>
                              Stock is managed separately
                            </Text>
                            <Button
                              component={Link}
                              href={`/admin/inventory?q=${encodeURIComponent(v.sku)}`}
                              size="compact-sm"
                              variant="subtle"
                              mt="xs"
                            >
                              Manage inventory →
                            </Button>
                          </div>
                        )}
                      </SimpleGrid>
                      <Checkbox
                        label="Available for sale"
                        description="Disable to stop selling this option while preserving order history."
                        {...form.getInputProps(`${prefix}.isActive`, {
                          type: "checkbox",
                        })}
                      />
                    </div>
                  );
                })}
              </section>
              <section className="ad-editor-card">
                <h2>Device compatibility</h2>
                <p className="ad-card-description">
                  Tag specific devices. Leave empty only for universal
                  accessories.
                </p>
                <MultiSelect
                  label="Compatible devices"
                  searchable
                  clearable
                  hidePickedOptions
                  maxValues={200}
                  placeholder="Search a phone or car model"
                  data={taxonomy.deviceModels.map((m) => ({
                    value: m.id,
                    label: `${m.brand.name} · ${m.name} (${m.type === "PHONE" ? "Phone" : "Car"})`,
                  }))}
                  {...form.getInputProps("compatibleDeviceModelIds")}
                />
              </section>
            </div>
            <aside className="ad-catalog-stack">
              <section className="ad-editor-card">
                <h2>Publishing</h2>
                <p className="ad-card-description">
                  Only published products appear in the store.
                </p>
                <Stack gap="md">
                  {current && <ProductStatus status={current.status} />}
                  <NativeSelect
                    label="Product status"
                    required
                    data={[
                      { value: "DRAFT", label: "Draft" },
                      { value: "PUBLISHED", label: "Published" },
                      { value: "ARCHIVED", label: "Archived" },
                    ]}
                    {...form.getInputProps("status")}
                  />
                  <Select
                    label="Subcategory"
                    searchable
                    required
                    placeholder="Choose a subcategory"
                    data={taxonomy.subcategories.map((s) => ({
                      value: s.id,
                      label: `${s.category.name} / ${s.name}`,
                    }))}
                    {...form.getInputProps("subcategoryId")}
                  />
                  <Select
                    label="Product badge"
                    clearable
                    placeholder="No badge"
                    data={[
                      { value: "BESTSELLER", label: "Bestseller" },
                      { value: "NEW", label: "New" },
                      { value: "SALE", label: "Sale" },
                    ]}
                    {...form.getInputProps("badge")}
                  />
                  <Text size="xs" c="dimmed">
                    Archive products you no longer sell. Existing orders keep
                    their original product and price details.
                  </Text>
                </Stack>
              </section>
              <section className="ad-editor-card">
                <h2>Product photography</h2>
                <Text size="sm" c="dimmed" mt="sm">
                  {current
                    ? "Open Photos to upload, reorder, or assign pictures to variants."
                    : "Save your product first, then add photos for the product and its variants."}
                </Text>
                {current && (
                  <Button
                    variant="light"
                    fullWidth
                    mt="md"
                    onClick={() => setTab("photos")}
                  >
                    Manage photos
                  </Button>
                )}
              </section>
            </aside>
          </div>
          <div className="ad-editor-save">
            <Text size="sm" c="dimmed">
              {dirty
                ? "You have unsaved changes."
                : current
                  ? "All product details saved."
                  : "Create your first variant to get started."}
            </Text>
            <Group gap="sm">
              <Button
                type="button"
                variant="default"
                disabled={busy}
                onClick={() => {
                  form.setValues(values(current));
                  form.resetDirty(values(current));
                  setError("");
                }}
              >
                Reset changes
              </Button>
              <Button
                type="submit"
                loading={busy}
                leftSection={<Save size={16} />}
              >
                {current ? "Save product" : "Create product"}
              </Button>
            </Group>
          </div>
        </form>
      )}
    </>
  );
}
