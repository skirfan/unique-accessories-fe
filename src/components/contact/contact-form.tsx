"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useCatalog } from "@/components/providers/catalog-provider";

export function ContactForm() {
  const { settings } = useCatalog();
  const [messageUrl, setMessageUrl] = useState("");
  const messageId = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings.whatsappNumber) return;
    const form = new FormData(e.currentTarget);
    const text = `Contact enquiry
Name: ${form.get("name")}
Email: ${form.get("email")}
Subject: ${form.get("subject")}

${form.get("message")}`;
    setMessageUrl(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-navy-100 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full Name" name="name" required />
        <FormField label="Email" name="email" type="email" required />
      </div>
      <FormField label="Subject" name="subject" required />
      <div>
        <label
          htmlFor={messageId}
          className="mb-1.5 block text-xs font-semibold text-navy-500"
        >
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm text-navy-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 focus:border-accent-400"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!settings.whatsappNumber}
        className="w-full max-w-full whitespace-normal px-4 text-sm disabled:opacity-60 sm:w-auto sm:self-start sm:px-8 sm:text-base"
      >
        Prepare WhatsApp message
      </Button>
      {!settings.whatsappNumber && (
        <p className="text-xs text-navy-500">
          Contact messaging is being set up.
        </p>
      )}
      {messageUrl && (
        <p className="text-sm">
          <a
            href={messageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent-700 underline"
          >
            Open your message in WhatsApp
          </a>
          <span className="mt-1 block text-xs text-navy-500">
            Tap Send in WhatsApp to send your enquiry.
          </span>
        </p>
      )}
    </form>
  );
}
