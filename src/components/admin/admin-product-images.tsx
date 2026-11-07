"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FileButton,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/lib/use-unsaved-changes";
import { adminApi } from "@/lib/admin-api";
import type { AdminProduct } from "@/types/catalog-admin";
export function AdminProductImages({
  product,
  dirty,
  onSaved,
  onDirtyChange,
}: {
  product: AdminProduct;
  dirty: boolean;
  onSaved: (product: AdminProduct) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [storage, setStorage] = useState<"r2" | "local" | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    adminApi<{ provider: "r2" | "local" }>("/admin/media", {
      signal: controller.signal,
    })
      .then((data) => setStorage(data.provider))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const [images, setImages] = useState(product.images);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const changed = JSON.stringify(images) !== JSON.stringify(product.images);
  const disabled = busy || dirty;
  useUnsavedChanges(changed);
  useEffect(() => {
    onDirtyChange(changed);
  }, [changed, onDirtyChange]);
  function saved(p: AdminProduct) {
    onSaved(p);
    setImages(p.images);
    toast.success("Product photos updated");
  }
  async function upload(file: File | null) {
    if (!file) return;
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image no larger than 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("image", file);
      saved(
        await adminApi<AdminProduct>(
          `/admin/products/${product.id}/images?version=${product.version}`,
          { method: "POST", body: form },
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload image.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      saved(
        await adminApi<AdminProduct>(`/admin/products/${product.id}/images`, {
          method: "PATCH",
          body: JSON.stringify({
            version: product.version,
            images: images.map((i) => ({
              id: i.id,
              variantId: i.variantId,
              altText: i.altText ?? "",
            })),
          }),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save photos.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!removeId) return;
    setBusy(true);
    setError("");
    try {
      saved(
        await adminApi<AdminProduct>(
          `/admin/products/${product.id}/images/${removeId}`,
          {
            method: "DELETE",
            body: JSON.stringify({ version: product.version }),
          },
        ),
      );
      setRemoveId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete image.");
      setRemoveId(null);
    } finally {
      setBusy(false);
    }
  }
  const move = (index: number, delta: number) => {
    const next = [...images];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setImages(next);
  };
  return (
    <section className="ad-editor-card">
      <Group justify="space-between" mb="lg">
        <div>
          <h2>Product photos</h2>
          <Text size="sm" c="dimmed">
            JPEG, PNG or WebP · Up to 5 MB each · First photo is the cover
            {storage &&
              ` · ${storage === "r2" ? "Cloudflare R2" : "Local storage"}`}
          </Text>
        </div>
        <FileButton onChange={upload} accept="image/jpeg,image/png,image/webp">
          {(props) => (
            <Button
              {...props}
              leftSection={<ImagePlus size={16} />}
              loading={busy}
              disabled={disabled || changed || images.length >= 20}
            >
              Upload photo
            </Button>
          )}
        </FileButton>
      </Group>
      {dirty && (
        <Alert color="blue" mb="md">
          Save or reset your product details before editing photos.
        </Alert>
      )}
      {error && (
        <Alert color="red" mb="md" role="alert">
          {error}
        </Alert>
      )}
      {images.length ? (
        <div className="ad-photo-grid">
          {images.map((image, index) => (
            <article className="ad-photo-card" key={image.id}>
              <Image
                unoptimized
                width={400}
                height={400}
                src={image.thumbnailUrl ?? image.url}
                alt={image.altText ?? product.name}
              />
              <Text size="xs" fw={600} c="dimmed">
                {index === 0 ? "Cover photo" : `Photo ${index + 1}`}
              </Text>
              <TextInput
                label={`Alt text for photo ${index + 1}`}
                size="sm"
                maxLength={200}
                value={image.altText ?? ""}
                disabled={disabled}
                onChange={(e) =>
                  setImages(
                    images.map((i) =>
                      i.id === image.id ? { ...i, altText: e.target.value } : i,
                    ),
                  )
                }
              />
              <Select
                label={`Variant for photo ${index + 1}`}
                size="sm"
                clearable
                placeholder="All variants"
                disabled={disabled}
                data={product.variants.map((v) => ({
                  value: v.id,
                  label:
                    [v.color, v.material, v.capacity]
                      .filter(Boolean)
                      .join(" / ") || v.sku,
                }))}
                value={image.variantId}
                onChange={(variantId) =>
                  setImages(
                    images.map((i) =>
                      i.id === image.id ? { ...i, variantId } : i,
                    ),
                  )
                }
              />
              <Group justify="space-between" gap="xs">
                <Group gap={4}>
                  <Button
                    size="compact-xs"
                    variant="default"
                    aria-label={`Move photo ${index + 1} earlier`}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowLeft size={14} />
                  </Button>
                  <Button
                    size="compact-xs"
                    variant="default"
                    aria-label={`Move photo ${index + 1} later`}
                    disabled={disabled || index === images.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowRight size={14} />
                  </Button>
                </Group>
                <Button
                  color="red"
                  size="compact-xs"
                  variant="subtle"
                  disabled={disabled || changed}
                  onClick={() => setRemoveId(image.id)}
                  leftSection={<Trash2 size={13} />}
                >
                  Delete
                </Button>
              </Group>
            </article>
          ))}
        </div>
      ) : (
        <div className="ad-catalog-empty">
          <ImagePlus size={32} />
          <strong>Add your first product photo</strong>
          <p>Photos are optimized automatically for your store.</p>
        </div>
      )}
      <Group justify="space-between" mt="xl">
        <Text size="sm" c="dimmed">
          {images.length}/20 photos{changed ? " · Unsaved photo changes" : ""}
        </Text>
        <Button disabled={disabled || !changed} loading={busy} onClick={save}>
          Save photo changes
        </Button>
      </Group>
      <Modal
        closeButtonProps={{ "aria-label": "Close dialog" }}
        opened={Boolean(removeId)}
        onClose={() => !busy && setRemoveId(null)}
        title="Delete this photo?"
        centered
      >
        <Stack>
          <Text size="sm">
            The photo will be removed from this product and its storefront
            gallery.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={busy}
              onClick={() => setRemoveId(null)}
            >
              Keep photo
            </Button>
            <Button color="red" loading={busy} onClick={remove}>
              Delete photo
            </Button>
          </Group>
        </Stack>
      </Modal>
    </section>
  );
}
