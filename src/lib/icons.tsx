import {
  BatteryCharging,
  Cable,
  Car,
  Headphones,
  Layers,
  Music2,
  Package,
  Plug,
  ShieldCheck,
  Smartphone,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Maps the "icon" string stored in the mock JSON (categories/subcategories/
// products) to an actual component. Keeps the data layer framework-agnostic
// while still giving us real icons on the storefront.
const registry: Record<string, LucideIcon> = {
  Smartphone,
  Car,
  ShieldCheck,
  Headphones,
  Plug,
  Cable,
  BatteryCharging,
  Layers,
  Zap,
  Video,
  Music2,
};

export function getIcon(name: string): LucideIcon {
  return registry[name] ?? Package;
}
