"use client";

import { useState } from "react";
import Modal from "./Modal";
import { DEFAULT_LOCATION_COLOR, Location } from "@/types";
import { generateId } from "@/lib/utils";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#a855f7", // purple
  "#ec4899", // pink
  "#64748b", // slate
];

interface Props {
  location?: Location;
  onClose: () => void;
  onSave: (location: Location) => void;
}

export default function LocationFormModal({ location, onClose, onSave }: Props) {
  const [name, setName] = useState(location?.name ?? "");
  const [color, setColor] = useState(location?.color ?? DEFAULT_LOCATION_COLOR);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("場所名は必須です。");
      return;
    }
    onSave({
      id: location?.id ?? generateId("loc"),
      name: name.trim(),
      color,
    });
    onClose();
  };

  return (
    <Modal title={location ? "場所を編集" : "場所を追加"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">場所名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 桑山"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">色</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
            />
            <span className="text-sm text-slate-500">{color}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={preset}
                style={{ backgroundColor: preset }}
                className={`h-7 w-7 rounded-full border-2 ${
                  color.toLowerCase() === preset ? "border-slate-700" : "border-white"
                } shadow ring-1 ring-slate-200`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>
  );
}
