"use client";
import { AdminInvoiceLogo } from "./admin-invoice-logo";
import { AdminIntegrations } from "./admin-integrations";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Info,
  FileText,
  MessageCircle,
  QrCode,
  Save,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import type { StoreSettings } from "@/types/commerce";
import {
  AdminButton,
  AdminField,
  AdminPageHeading,
  AdminToggle,
} from "./admin-ui";
export function AdminSettings({ initial }: { initial: StoreSettings }) {
  const [settings, setSettings] = useState(initial);
  const [formRevision, setFormRevision] = useState(0);
  const [brandingBusy, setBrandingBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const router = useRouter();
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (brandingBusy) return;
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    try {
      const result = await adminApi<StoreSettings>("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          autoApproveOrders: settings.autoApproveOrders,
          ...Object.fromEntries(
            [
              "sellerName",
              "sellerAddress",
              "sellerEmail",
              "sellerPhone",
              "sellerGstin",
            ].map((k) => [k, text(k)]),
          ),
          minimumOrderEnabled: settings.minimumOrderEnabled,
          minimumOrderAmount: Number(text("minimumOrderAmount")),
          shippingFee: Number(text("shippingFee")),
          freeShippingThreshold: Number(text("freeShippingThreshold")),
          codEnabled: settings.codEnabled,
          upiEnabled: settings.upiEnabled,
          whatsappNumber: text("whatsappNumber"),
          upiId: text("upiId"),
          upiName: text("upiName"),
          upiQrImage: settings.upiQrImage,
          paymentInstructions: text("paymentInstructions"),
          version: settings.version,
        }),
      });
      setSettings(result);
      setFormRevision((value) => value + 1);
      router.refresh();
      setMessage(
        "Store settings saved. New checkout requests will use these settings.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save your settings.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function readQr(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 512 * 1024
    ) {
      setError("Upload a PNG or JPEG image up to 512 KB.");
      return;
    }
    setReading(true);
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read QR image."));
        reader.readAsDataURL(file);
      });
      setSettings((s) => ({ ...s, upiQrImage: result }));
      setError("");
      setMessage("QR image selected. Save store settings to apply it.");
    } catch {
      setError("Could not read QR image.");
    } finally {
      setReading(false);
    }
  }
  return (
    <>
      <AdminPageHeading
        eyebrow="MAKE IT YOURS"
        title="The details make the difference."
        description="Shape how customers order, pay, and connect with your store."
      />
      <div className="ad-settings-layout">
        <nav className="ad-settings-nav" aria-label="Settings sections">
          <a href="#ordering">
            <ShoppingBag size={15} />
            Ordering
          </a>
          <a href="#shipping">
            <Truck size={15} />
            Shipping
          </a>
          <a href="#whatsapp">
            <MessageCircle size={15} />
            WhatsApp
          </a>
          <a href="#payments">
            <CreditCard size={15} />
            Payments & QR
          </a>
          <a href="#invoices">
            <FileText size={15} /> Orders & invoices
          </a>
        </nav>
        <form key={formRevision} onSubmit={save} className="ad-settings-stack">
          <section id="ordering" className="ad-card ad-settings-section">
            <div className="ad-settings-section-head">
              <span>
                <SlidersHorizontal size={17} />
              </span>
              <div>
                <h2>Ordering preferences</h2>
                <p>A simple rule for a better order experience.</p>
              </div>
            </div>
            <div className="ad-settings-body">
              <AdminToggle
                label="Require a minimum order amount"
                description="Turn off to accept orders of any value. Your saved amount is retained."
                checked={settings.minimumOrderEnabled}
                onChange={(checked) =>
                  setSettings((s) => ({ ...s, minimumOrderEnabled: checked }))
                }
              />
              <AdminField
                label="Minimum order amount (₹)"
                name="minimumOrderAmount"
                type="number"
                min="0"
                max="1000000"
                step="0.01"
                required
                defaultValue={settings.minimumOrderAmount}
                hint="Merchandise total after discounts, before shipping."
              />
              <p className="ad-settings-note">
                <Info size={13} />
                Changes apply to new requests. Orders already placed keep their
                recorded totals.
              </p>
            </div>
          </section>
          <section id="shipping" className="ad-card ad-settings-section">
            <div className="ad-settings-section-head">
              <span>
                <Truck size={17} />
              </span>
              <div>
                <h2>Shipping</h2>
                <p>Clear delivery pricing, from cart to checkout.</p>
              </div>
            </div>
            <div className="ad-settings-body">
              <div className="ad-fields-two">
                <AdminField
                  label="Standard shipping fee (₹)"
                  name="shippingFee"
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.01"
                  required
                  defaultValue={settings.shippingFee}
                />
                <AdminField
                  label="Free shipping from (₹, after discounts)"
                  name="freeShippingThreshold"
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.01"
                  required
                  defaultValue={settings.freeShippingThreshold}
                />
              </div>
            </div>
          </section>
          <section id="whatsapp" className="ad-card ad-settings-section">
            <div className="ad-settings-section-head">
              <span>
                <MessageCircle size={17} />
              </span>
              <div>
                <h2>WhatsApp follow-up</h2>
                <p>Keep the conversation going after checkout.</p>
              </div>
            </div>
            <div className="ad-settings-body">
              <AdminField
                label="WhatsApp business number"
                name="whatsappNumber"
                placeholder="919558658484"
                inputMode="tel"
                pattern="[1-9][0-9]{7,14}"
                defaultValue={settings.whatsappNumber}
                hint="Include country code, with digits only. Leave blank to hide WhatsApp links."
              />
            </div>
          </section>
          <section id="payments" className="ad-card ad-settings-section">
            <div className="ad-settings-section-head">
              <span>
                <CreditCard size={17} />
              </span>
              <div>
                <h2>Payment options</h2>
                <p>Let customers pay in a way that works for your store.</p>
              </div>
            </div>
            <div className="ad-settings-body">
              <AdminToggle
                label="Offer Cash on Delivery"
                description="Collect payment when the customer receives their order."
                checked={settings.codEnabled}
                onChange={(checked) =>
                  setSettings((s) => ({ ...s, codEnabled: checked }))
                }
              />
              <AdminToggle
                label="Offer manually verified UPI payments"
                description="Payment details appear on confirmed orders. Verify each receipt before fulfillment."
                checked={settings.upiEnabled}
                onChange={(checked) =>
                  setSettings((s) => ({ ...s, upiEnabled: checked }))
                }
              />
              <div className="ad-fields-two">
                <AdminField
                  label="Merchant UPI ID"
                  name="upiId"
                  placeholder="your-store@bank"
                  required={settings.upiEnabled && !settings.upiQrImage}
                  defaultValue={settings.upiId}
                  hint="Used to generate an amount-specific QR."
                />
                <AdminField
                  label="Recipient / business name"
                  name="upiName"
                  required={settings.upiEnabled}
                  maxLength={100}
                  defaultValue={settings.upiName}
                />
              </div>
              <div className="ad-field">
                <label htmlFor="merchant-qr">
                  Merchant QR image (optional)
                </label>
                {settings.upiQrImage ? (
                  <div className="ad-qr-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.upiQrImage}
                      width={120}
                      height={120}
                      alt="Merchant QR preview"
                    />
                    <div>
                      <p>
                        <QrCode size={13} className="inline" /> Your merchant QR
                        is ready.
                        <br />
                        Save changes to use it for accepted UPI orders.
                      </p>
                      <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setSettings((s) => ({ ...s, upiQrImage: null }))
                        }
                      >
                        <X size={12} />
                        Remove QR image
                      </AdminButton>
                    </div>
                  </div>
                ) : (
                  <label className="ad-upload" htmlFor="merchant-qr">
                    <UploadCloud size={25} strokeWidth={1.4} />
                    <strong>
                      {reading
                        ? "Reading your image…"
                        : "Upload your merchant QR"}
                    </strong>
                    <small>PNG or JPEG, up to 512 KB</small>
                  </label>
                )}
                <input
                  id="merchant-qr"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => readQr(e.target.files?.[0])}
                  className="ad-input"
                  aria-label="Merchant QR image (optional)"
                />
                <small>
                  Uploaded QR takes priority. Check the recipient details;
                  customers enter the exact order amount when using a static QR.
                </small>
              </div>
              <div className="ad-field">
                <label htmlFor="payment-instructions">
                  Payment instructions
                </label>
                <textarea
                  id="payment-instructions"
                  name="paymentInstructions"
                  className="ad-input"
                  rows={3}
                  maxLength={1000}
                  defaultValue={settings.paymentInstructions}
                />
              </div>
              <p className="ad-settings-note">
                <Info size={13} />
                Keep at least one payment option enabled. A UPI ID or QR image
                and recipient name are required to offer UPI.
              </p>
            </div>
          </section>
          <section id="invoices" className="ad-card ad-settings-section">
            <div className="ad-card-heading">
              <div>
                <h2>Order confirmation & invoices</h2>
                <p>
                  New orders use these settings. Issued invoice details are kept
                  with each order.
                </p>
              </div>
            </div>
            <div
              className="ad-detail-body"
              style={{ display: "grid", gap: 18 }}
            >
              <AdminInvoiceLogo
                settings={settings}
                disabled={busy}
                onBusyChange={setBrandingBusy}
                onUpdated={(logo) =>
                  setSettings((current) => ({
                    ...current,
                    invoiceLogoImage: logo.invoiceLogoImage,
                    invoiceLogoUrl: logo.invoiceLogoUrl,
                    invoiceLogoKey: logo.invoiceLogoKey,
                    version: logo.version,
                  }))
                }
              />
              <AdminToggle
                label="Automatically confirm new orders"
                checked={settings.autoApproveOrders}
                onChange={(checked) =>
                  setSettings((s) => ({ ...s, autoApproveOrders: checked }))
                }
              />
              <p className="ad-small-label">
                Stock is allocated immediately when enabled. UPI payments still
                require verification before shipping.
              </p>
              <div className="ad-fields-two">
                <AdminField
                  label="Seller / business name"
                  name="sellerName"
                  required
                  maxLength={150}
                  defaultValue={settings.sellerName}
                />
                <AdminField
                  label="Seller email"
                  name="sellerEmail"
                  type="email"
                  defaultValue={settings.sellerEmail}
                />
                <AdminField
                  label="Seller phone"
                  name="sellerPhone"
                  maxLength={30}
                  defaultValue={settings.sellerPhone}
                />
                <AdminField
                  label="GSTIN (if registered)"
                  name="sellerGstin"
                  maxLength={20}
                  defaultValue={settings.sellerGstin}
                />
              </div>
              <div className="ad-field">
                <label htmlFor="sellerAddress">Seller address</label>
                <textarea
                  id="sellerAddress"
                  name="sellerAddress"
                  className="ad-input"
                  rows={3}
                  maxLength={1000}
                  defaultValue={settings.sellerAddress}
                />
              </div>
              <p className="ad-small-label">
                Enter your actual business details before accepting live orders.
                This invoice records the sale amount; separate GST calculation
                is not configured.
              </p>
            </div>
          </section>
          <AdminIntegrations />
          {message && (
            <p role="status" className="ad-alert ad-alert--success">
              {message}
            </p>
          )}
          {error && (
            <div role="alert" className="ad-alert ad-alert--error">
              <span>{error}</span>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() =>
                  adminApi<StoreSettings>("/admin/settings")
                    .then((result) => {
                      setSettings(result);
                      setFormRevision((value) => value + 1);
                      setError("");
                      setMessage("Latest settings loaded.");
                    })
                    .catch((e) => setError(e.message))
                }
              >
                Reload settings
              </AdminButton>
            </div>
          )}
          <div className="ad-settings-save">
            <span>Changes take effect after you save.</span>
            <AdminButton
              type="submit"
              busy={busy}
              disabled={reading || brandingBusy}
            >
              <Save size={14} />
              {busy ? "Saving…" : "Save store settings"}
            </AdminButton>
          </div>
        </form>
      </div>
    </>
  );
}
