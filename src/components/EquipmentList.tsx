'use client';

export interface EquipmentItem {
    id: number;
    name: string;
    quantity: number;
}

export interface EquipmentData {
    classId: number;
    className: string;
    items: EquipmentItem[];
}

interface EquipmentListProps {
    data: EquipmentData;
    selectedIds: Set<number>;
    quantities: Map<number, number>;
    onToggle: (id: number) => void;
    onQuantityChange: (id: number, quantity: number) => void;
}

const MIN_QUANTITY = 0;
const MAX_QUANTITY = 99;

export default function EquipmentList({
                                          data,
                                          selectedIds,
                                          quantities,
                                          onToggle,
                                          onQuantityChange
                                      }: EquipmentListProps) {
    return (
        <div className="mt-6">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4 text-lg">
                {data.className}
            </h3>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {/* Header */}
                <div
                    className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                    <div>Item</div>
                    <div className="text-center w-24">Quantity</div>
                    <div className="w-10"></div>
                </div>

                {/* Items */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {data.items.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        const currentQuantity = quantities.get(item.id) ?? item.quantity;

                        return (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 transition-colors ${
                                    isSelected
                                        ? 'bg-white dark:bg-zinc-900'
                                        : 'bg-zinc-50 dark:bg-zinc-950 opacity-60'
                                }`}
                            >
                                {/* Item Name */}
                                <div
                                    onClick={() => onToggle(item.id)}
                                    className="cursor-pointer flex items-center text-zinc-900 dark:text-white"
                                >
                                    <span>{item.name}</span>
                                </div>

                                {/* Quantity Input */}
                                <div className="flex items-center w-24">
                                    <input
                                        type="number"
                                        min={MIN_QUANTITY}
                                        max={MAX_QUANTITY}
                                        value={currentQuantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            const clamped = Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, val));
                                            onQuantityChange(item.id, clamped);
                                        }}
                                        disabled={!isSelected}
                                        className="w-full px-2 py-1 text-center border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Checkmark */}
                                <div className="flex items-center justify-center w-10">
                                    <button
                                        onClick={() => onToggle(item.id)}
                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-500 text-white'
                                                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                        }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

