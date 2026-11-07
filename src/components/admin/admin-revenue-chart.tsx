"use client";
import { useEffect, useId, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { AdminOverview } from "@/types/admin";
type Point = { x: number; y: number };
/** Monotone cubic interpolation avoids inventing peaks/negative revenue between samples. */
export function smoothLine(points: Point[]) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const slopes = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  const tangents = points.map((_, i) =>
    i === 0
      ? slopes[0]
      : i === points.length - 1
        ? slopes.at(-1)!
        : slopes[i - 1] * slopes[i] <= 0
          ? 0
          : 2 / (1 / slopes[i - 1] + 1 / slopes[i]),
  );
  return points.slice(1).reduce((path, p, i) => {
    const previous = points[i];
    const third = (p.x - previous.x) / 3;
    return `${path} C ${previous.x + third} ${previous.y + tangents[i] * third}, ${p.x - third} ${p.y - tangents[i + 1] * third}, ${p.x} ${p.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}
export function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const id = useId().replace(/:/g, "");
  const max = Math.max(1, ...values);
  const points = values.map((value, i) => ({
    x: 3 + (i / Math.max(1, values.length - 1)) * 68,
    y: 39 - (value / max) * 30,
  }));
  const path = smoothLine(points);
  return (
    <svg className="neu-sparkline" viewBox="0 0 76 48" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {points.length > 0 && (
        <>
          <path d={`${path} L 71 46 L 3 46 Z`} fill={`url(#${id})`} />
          <path d={path} stroke={color} fill="none" strokeWidth="1.8" />
          {points.at(-1) && (
            <circle
              cx={points.at(-1)!.x}
              cy={points.at(-1)!.y}
              r="2.6"
              fill={color}
              stroke="var(--neu-surface)"
              strokeWidth="1.2"
            />
          )}
        </>
      )}
    </svg>
  );
}
export function AdminRevenueChart({
  activity,
}: {
  activity: AdminOverview["dashboard"]["revenueActivity"];
}) {
  const [active, setActive] = useState<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const id = useId().replace(/:/g, "");
  const height = 180,
    left = 43,
    right = 14,
    top = 13,
    bottom = 30;
  const floor = height - bottom;
  const largest = Math.max(0, ...activity.map((d) => d.revenue));
  const rawMax = Math.max(1000, largest * 1.15);
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const maximum = Math.ceil(rawMax / step) * step;
  const points = activity.map((day, index) => ({
    x:
      left +
      (index / Math.max(1, activity.length - 1)) * (width - left - right),
    y: floor - (day.revenue / maximum) * (floor - top),
  }));
  const path = smoothLine(points);
  const selected = active === null ? null : activity[active];
  const point = active === null ? null : points[active];
  const tickCount = Math.min(width < 500 ? 4 : 7, activity.length);
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round((i / Math.max(1, tickCount - 1)) * (activity.length - 1)),
  );
  const money = (value: number) =>
    value >= 100000
      ? `₹${Number((value / 100000).toFixed(1))}L`
      : value >= 1000
        ? `₹${Number((value / 1000).toFixed(1))}k`
        : `₹${value}`;
  return (
    <div ref={container} className="neu-revenue-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={`Recorded revenue. ${activity.map((day) => `${day.label}: ${formatPrice(day.revenue)}`).join("; ")}`}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * width;
          setActive(
            Math.max(
              0,
              Math.min(
                activity.length - 1,
                Math.round(
                  ((x - left) / (width - left - right)) * (activity.length - 1),
                ),
              ),
            ),
          );
        }}
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={`revenue-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2875ff" stopOpacity=".35" />
            <stop offset="100%" stopColor="#2875ff" stopOpacity=".025" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }, (_, i) => {
          const y = top + (i * (floor - top)) / 4;
          return (
            <g key={i}>
              <line
                className="neu-chart-gridline"
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
              />
              <text
                className="neu-chart-label"
                x={left - 12}
                y={y + 4}
                textAnchor="end"
              >
                {money(maximum * (1 - i / 4))}
              </text>
            </g>
          );
        })}
        {activity
          .filter((_, index) => ticks.includes(index))
          .map((day) => {
            const i = activity.indexOf(day);
            const x = points[i].x;
            return (
              <g key={day.date}>
                <line
                  className="neu-chart-gridline"
                  x1={x}
                  y1={top}
                  x2={x}
                  y2={floor}
                />
                <text
                  className="neu-chart-label"
                  x={x}
                  y={height - 5}
                  textAnchor={
                    i === 0
                      ? "start"
                      : i === activity.length - 1
                        ? "end"
                        : "middle"
                  }
                >
                  {day.label}
                </text>
              </g>
            );
          })}
        {points.length > 0 && (
          <>
            <path
              d={`${path} L ${points.at(-1)!.x} ${floor} L ${left} ${floor} Z`}
              fill={`url(#revenue-${id})`}
            />
            <path
              d={path}
              className="neu-revenue-line"
              fill="none"
              stroke="#2875ff"
              strokeWidth="2.8"
            />
            {point && (
              <line
                x1={point.x}
                x2={point.x}
                y1={top}
                y2={floor}
                className="neu-chart-crosshair"
              />
            )}
            {points.map((p, i) => (
              <circle
                key={activity[i].date}
                cx={p.x}
                cy={p.y}
                r={active === i ? 5 : 3.6}
                className="neu-chart-point"
                tabIndex={i === (active ?? 0) ? 0 : -1}
                role="button"
                aria-label={`${activity[i].label}: ${formatPrice(activity[i].revenue)}`}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = Math.max(
                      0,
                      Math.min(
                        activity.length - 1,
                        i + (e.key === "ArrowRight" ? 1 : -1),
                      ),
                    );
                    e.currentTarget.parentElement
                      ?.querySelectorAll<SVGCircleElement>(".neu-chart-point")
                      [next]?.focus();
                  }
                }}
              />
            ))}
          </>
        )}
      </svg>
      {selected && point && (
        <div
          className="neu-chart-tooltip"
          style={{
            left: `${Math.max(13, Math.min(85, (point.x / width) * 100))}%`,
            top: `${Math.max(0, (point.y / height) * 100 - 27)}%`,
          }}
        >
          <span>
            {new Date(`${selected.date}T00:00:00+05:30`).toLocaleDateString(
              "en-IN",
              {
                timeZone: "Asia/Kolkata",
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </span>
          <strong>
            <i />
            {formatPrice(selected.revenue)}
          </strong>
        </div>
      )}
      {largest === 0 && (
        <div className="neu-chart-zero">
          Your revenue story starts with your first recorded payment.
        </div>
      )}
    </div>
  );
}
