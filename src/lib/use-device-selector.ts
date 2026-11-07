"use client";

import { useMemo, useState } from "react";
import { useCatalog } from "@/components/providers/catalog-provider";
import type { DeviceType } from "@/types";

/**
 * Shared "device type -> brand -> model" cascading selection state, used by
 * the homepage device finder, the PDP compatibility checker, and the
 * catalog sidebar filter. Changing type or brand resets the fields below it.
 *
 * @param initialDeviceModelId - if given, resolves the initial type/brand/model
 * from it (e.g. restoring a `?device=` URL param) instead of starting empty.
 */
export function useDeviceSelector(initialDeviceModelId?: string) {
  const { getBrands, getDeviceModelById, getDeviceModelsByBrand } =
    useCatalog();
  const initialModel = initialDeviceModelId
    ? getDeviceModelById(initialDeviceModelId)
    : undefined;

  const [type, setTypeState] = useState<DeviceType>(
    initialModel?.type ?? "PHONE",
  );
  const [brandId, setBrandIdState] = useState(initialModel?.brandId ?? "");
  const [modelId, setModelIdState] = useState(initialModel?.id ?? "");

  const brands = useMemo(() => getBrands(type), [type, getBrands]);
  const models = useMemo(
    () => (brandId ? getDeviceModelsByBrand(brandId) : []),
    [brandId, getDeviceModelsByBrand],
  );

  function setType(next: DeviceType) {
    setTypeState(next);
    setBrandIdState("");
    setModelIdState("");
  }

  function setBrandId(next: string) {
    setBrandIdState(next);
    setModelIdState("");
  }

  function setModelId(next: string) {
    setModelIdState(next);
  }

  return {
    type,
    setType,
    brandId,
    setBrandId,
    modelId,
    setModelId,
    brands,
    models,
  };
}

export type DeviceSelector = ReturnType<typeof useDeviceSelector>;
