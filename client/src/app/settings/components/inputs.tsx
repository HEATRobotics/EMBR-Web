"use client";

import React from "react";

export function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      className="w-full px-4 py-2 border rounded-md !bg-white !text-black placeholder:!text-gray-400"
      value={Number.isFinite(value) ? value : ""}
      placeholder={placeholder}
      onChange={(e) => {
        if (e.target.value === "") return onChange(NaN);
        onChange(Number(e.target.value));
      }}
    />
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className="w-full px-4 py-2 border rounded-md !bg-white !text-black placeholder:!text-gray-400"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      className="w-full px-4 py-2 border rounded-md !bg-white !text-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <div className="text-sm font-medium">{label}</div>
        {description ? (
          <div className="text-xs opacity-80">{description}</div>
        ) : null}
      </span>
    </label>
  );
}
