// src/pages/AdminReorder.jsx
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Sidebar from "../components/Sidebar";
import api from "../api/client";
import { PIN_OPTIONS } from "../constants/pins";

// ==== Draggable item (member row) ====
const MemberRow = ({ item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm
                  ${isDragging ? "opacity-75 ring-2 ring-blue-300" : ""}`}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.memberName}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-slate-100" />
      )}
      <div className="min-w-0">
        <div className="truncate font-medium text-slate-800">
          {item.memberName}
        </div>
        <div className="truncate text-xs text-slate-500">
          ID: {item.memberId}
        </div>
      </div>
      <span className="ms-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
        #{item.pinOrder ?? 0}
      </span>
    </div>
  );
};

// ==== Pin card (1 การ์ด = 1 Pin) ====
const PinCard = ({ pin, items, onReorder, onSave, saving }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const ids = items.map((i) => i._id);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((it, idx) => ({
      ...it,
      pinOrder: idx + 1,
    }));
    onReorder(pin, reordered);
  };

  return (
    <section className="break-inside-avoid mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{pin}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {items.length} members
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((it) => (
              <MemberRow key={it._id} item={it} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onSave(pin)}
          disabled={saving}
          className={`rounded-lg px-3 py-1.5 text-sm text-white ${
            saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
};

const AdminReorder = () => {
  const [dataByPin, setDataByPin] = useState({});
  const [dirtyPins, setDirtyPins] = useState(new Set());
  const [savingPin, setSavingPin] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/members", {
        params: { page: 1, limit: 1000, orderBy: "pin", order: "asc" },
      });
      const rows = res.data.data || [];
      const grouped = PIN_OPTIONS.reduce((acc, p) => ({ ...acc, [p]: [] }), {});
      rows.forEach((r) => {
        if (!grouped[r.pin]) grouped[r.pin] = [];
        grouped[r.pin].push(r);
      });
      setDataByPin(grouped);
      setDirtyPins(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReorder = (pin, newItems) => {
    setDataByPin((prev) => ({ ...prev, [pin]: newItems }));
    setDirtyPins((prev) => new Set([...prev, pin]));
  };

  const savePin = async (pin) => {
    const list = dataByPin[pin] || [];
    if (!list.length) return;
    setSavingPin(pin);
    try {
      await api.put(
        "/api/members/reorder/bulk",
        {
          pin,
          items: list.map((it) => ({ id: it._id, pinOrder: it.pinOrder ?? 0 })),
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setDirtyPins((prev) => {
        const next = new Set(prev);
        next.delete(pin);
        return next;
      });
    } finally {
      setSavingPin("");
    }
  };

  const saveAll = async () => {
    for (const pin of Array.from(dirtyPins)) {
      // eslint-disable-next-line no-await-in-loop
      await savePin(pin);
    }
  };

  const hasDirty = dirtyPins.size > 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-50 p-6 ml-0 md:ml-64">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Reorder by Pin (Masonry)
          </h1>
          <button
            onClick={saveAll}
            disabled={!hasDirty}
            className={`rounded-lg px-4 py-2 text-white ${
              hasDirty ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400"
            }`}
          >
            {hasDirty ? "Save All Changes" : "No Changes"}
          </button>
        </div>

        {loading ? (
          <div className="text-slate-500">กำลังโหลด...</div>
        ) : (
          // ===== Masonry container: 1/2/3/4 columns พร้อมเว้นช่องเท่า ๆ กัน =====
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {PIN_OPTIONS.map((pin) => {
              const items = (dataByPin[pin] || [])
                .slice()
                .sort(
                  (a, b) =>
                    (a.pinOrder ?? 0) - (b.pinOrder ?? 0) ||
                    a.memberName.localeCompare(b.memberName)
                );
              const dirty = dirtyPins.has(pin);
              return (
                <PinCard
                  key={pin}
                  pin={pin}
                  items={items}
                  onReorder={handleReorder}
                  onSave={savePin}
                  saving={savingPin === pin}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReorder;
