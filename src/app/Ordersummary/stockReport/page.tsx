import PathShower from "@/src/components/pathShower";
import React from "react";
import StockDetails from "./stockdetailsnew";
const PathList = [
  ["Ordersummary", "Order Summary"],
  ["stockReport", "Stock Report"],
];
export default function StockPage() {
  return (
    <div>
      <StockDetails />
    </div>
  );
}
