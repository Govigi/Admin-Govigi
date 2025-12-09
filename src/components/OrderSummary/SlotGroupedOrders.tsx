import React from "react";
import OrdersTable from "./OrdersTable"; // Reusing the existing robust table

interface SlotGroupedOrdersProps {
    orders: any[];
    groupBySlot?: boolean;
}

export default function SlotGroupedOrders({ orders, groupBySlot = true }: SlotGroupedOrdersProps) {
    if (!groupBySlot) {
        return <OrdersTable orders={orders} />;
    }

    // Helper to normalize slot names (assuming slot data might be varied)
    const getSlot = (order: any) => {
        const slot = order.deliverySlot || order.slot || "Unassigned";
        return slot;
    };

    // Group orders
    const grouped = orders.reduce((acc: any, order) => {
        const slot = getSlot(order);
        if (!acc[slot]) acc[slot] = [];
        acc[slot].push(order);
        return acc;
    }, {});

    // Sort slots (Morning -> Afternoon -> Evening -> Unassigned)
    const slotOrder = ["Morning", "Afternoon", "Evening", "Unassigned"];
    const sortedSlots = Object.keys(grouped).sort((a, b) => {
        const idxA = slotOrder.findIndex((s) => a.includes(s));
        const idxB = slotOrder.findIndex((s) => b.includes(s));
        // If not found in simplified list, simple string sort
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    if (sortedSlots.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-md border border-gray-200">
                <p className="text-gray-500">No orders found for the selected filters.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {sortedSlots.map((slot) => (
                <div key={slot} className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-lg">
                            {slot} Delivery Slot
                        </h3>
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                            {grouped[slot].length} Orders
                        </span>
                    </div>
                    <div className="p-0">
                        {/* We pass specific subset of orders to the table. 
                 OrdersTable handles pagination internally, which is okay for per-slot Tables 
                 if the lists are long, but might disconnect "select all". 
                 For now, this is acceptable for the request. */}
                        <OrdersTable orders={grouped[slot]} />
                    </div>
                </div>
            ))}
        </div>
    );
}
