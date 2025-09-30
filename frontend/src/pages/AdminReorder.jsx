import React, { useEffect, useMemo, useState } from "react";
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

// Draggable card
const Card = ({ item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded shadow p-3 cursor-grab ${
        isDragging ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.memberName}
            className="h-10 w-10 object-cover rounded"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded" />
        )}
        <div className="truncate">
          <div className="font-semibold">{item.memberName}</div>
          <div className="text-xs text-gray-500">ID: {item.memberId}</div>
        </div>
        <div className="ml-auto text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
          #{item.pinOrder ?? 0}
        </div>
      </div>
    </div>
  );
};

// Column per pin
const PinColumn = ({ pin, items, onChangeOrder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ids = items.map((i) => i._id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    // Reindex pinOrder as 1..n (หรือ 0..n ก็ได้ตามนโยบาย)
    const normalized = newItems.map((it, idx) => ({
      ...it,
      pinOrder: idx + 1,
    }));

    onChangeOrder(pin, normalized);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border">
      <h3 className="font-bold mb-3">{pin}</h3>
      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((it) => (
              <Card key={it._id} item={it} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const AdminReorder = () => {
  const [dataByPin, setDataByPin] = useState({}); // { pin: items[] }
  const [dirtyPins, setDirtyPins] = useState(new Set()); // track คอลัมน์ที่มีการแก้
  const [loading, setLoading] = useState(true);
  const [savingPin, setSavingPin] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // ดึงแบบ page ใหญ่เพื่อโหลดทั้งหมด (ปรับได้ตามปริมาณข้อมูล)
      const res = await api.get("/api/members", {
        params: { page: 1, limit: 1000, orderBy: "pin", order: "asc" },
      });
      const rows = res.data.data || [];
      // group by pin
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

  const onChangeOrder = (pin, newItems) => {
    setDataByPin((prev) => ({ ...prev, [pin]: newItems }));
    setDirtyPins((prev) => new Set([...prev, pin]));
  };

  const savePin = async (pin) => {
    const list = dataByPin[pin] || [];
    if (!list.length) return;

    setSavingPin(pin);
    try {
      const payload = {
        pin,
        items: list.map((it) => ({ id: it._id, pinOrder: it.pinOrder ?? 0 })),
      };
      await api.put("/api/members/reorder/bulk", payload, {
        headers: { "Content-Type": "application/json" },
      });
      // หลังบันทึก ล้าง dirty state ของ pin นี้
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
      await savePin(pin);
    }
  };

  const hasDirty = dirtyPins.size > 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Reorder by Pin</h1>
          <button
            onClick={saveAll}
            disabled={!hasDirty}
            className={`px-4 py-2 rounded text-white ${
              hasDirty
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {hasDirty ? "Save All Changes" : "No Changes"}
          </button>
        </div>

        {loading ? (
          <div>กำลังโหลด...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PIN_OPTIONS.map((pin) => {
              const items = (dataByPin[pin] || []).slice(); // clone
              // ให้แน่ใจว่าเรียงตาม pinOrder ปัจจุบันก่อนแสดง
              items.sort(
                (a, b) =>
                  (a.pinOrder ?? 0) - (b.pinOrder ?? 0) ||
                  (a.memberName || "")
                    .toString()
                    .localeCompare((b.memberName || "").toString())
              );
              const dirty = dirtyPins.has(pin);
              return (
                <div key={pin} className="relative">
                  {dirty && (
                    <div className="absolute right-2 top-2 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                      Unsaved
                    </div>
                  )}
                  <PinColumn
                    pin={pin}
                    items={items}
                    onChangeOrder={onChangeOrder}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => savePin(pin)}
                      disabled={!dirty || savingPin === pin}
                      className={`px-3 py-1 rounded text-white ${
                        dirty ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
                      } ${savingPin === pin ? "opacity-70" : ""}`}
                    >
                      {savingPin === pin ? "Saving..." : "Save This Pin"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReorder;
