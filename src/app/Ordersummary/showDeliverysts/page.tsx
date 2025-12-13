import React from "react";
import DeliveryReport from "./deliverydetails";
const PathList = [
  ["Ordersummary", "Order Summary"],
  ["showDeliverysts", "Delivery Status and Updates"],
];
export default function DeliveryUpdates() {
  return (
    <div>
      <DeliveryReport />
    </div>
  );
}
