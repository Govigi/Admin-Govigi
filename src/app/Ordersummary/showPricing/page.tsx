import React from "react";
import PricingDetails from "./pricingdetails";
const PathList = [
  ["Ordersummary", "Order Summary"],
  ["showPricing", "Products & Pricing"],
];
export default function StockPricing() {
  return (
    <div>
      <PricingDetails />
    </div>
  );
}
