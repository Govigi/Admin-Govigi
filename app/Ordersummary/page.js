'use client';
import PathShower from "@/components/pathShower";
import { useRouter } from 'next/navigation'; 
import ShowStockReport from '@/components/OrderSummary/StockReport';
import ShowProdPricing from '@/components/OrderSummary/ProductPricing';
import ShowDeliveryUpdate from '@/components/OrderSummary/DeliveryUpdate';
export default function OrderSummary() {
    const router = useRouter();
    const stockData = [
  { item: "Tomatoes", quantity: "100 kg", price: "₹5,000", status: "In Stock" },
  { item: "Carrots", quantity: "200 kg", price: "₹4,000", status: "Low Stock" },
  { item: "Cabbage", quantity: "0 kg", price: "₹0", status: "Out of Stock" },
  {item: "PineApples", quantity:"150kg", price: "8,999", status:"In Stock"},
  { item: "Carrots", quantity: "200 kg", price: "₹4,000", status: "Low Stock" },
  { item: "Carrots", quantity: "200 kg", price: "₹4,000", status: "Low Stock" },
  { item: "Carrots", quantity: "200 kg", price: "₹4,000", status: "Low Stock" },
  
];
    const ProductDetails = [
        {item: "Tomatoes", price:"Rs 200", type: "KG", aval:"stock"},
        {item: "Tomatoes", price:"Rs 200", type: "KG", aval:"stock"},
        {item: "Tomatoes", price:"Rs 200", type: "KG", aval:"stock"},
        {item: "Tomatoes", price:"Rs 200", type: "KG", aval:"stock"},
        {item: "Tomatoes", price:"Rs 200", type: "KG", aval:"stock"},
        {item: "Tomatoes", price:"Rs 200", type: "KG", aval:"stock"},
    ]
    const DeliveryDetails = [
        {deliveryStatus: "Delivered", message: "Order #2201 delivered to Sai Mart", timeStamp: "14 Jul 2025, 11:40 AM"},
        {deliveryStatus: "Failed", message: "Order #2228: Address not reachable", timeStamp: "14 Jul 2025, 10:35 AM"},
        {deliveryStatus: "Delayed", message: "Order #2201 Delayed to Nehru Park", timeStamp: "14 Jul 2025, 11:40 AM"},
        {deliveryStatus: "Delayed", message: "Order #2201 Delayed to LBnagar", timeStamp: "14 Jul 2025, 11:40 AM"},
        {deliveryStatus: "Delayed", message: "Order #2201 Delayed to LBnagar", timeStamp: "14 Jul 2025, 11:40 AM"},
        {deliveryStatus: "Delayed", message: "Order #2201 Delayed to LBnagar", timeStamp: "14 Jul 2025, 11:40 AM"},
        {deliveryStatus: "Delayed", message: "Order #2201 Delayed to LBnagar", timeStamp: "14 Jul 2025, 11:40 AM"},
        {deliveryStatus: "Delayed", message: "Order #2201 Delayed to LBnagar", timeStamp: "14 Jul 2025, 11:40 AM"},
    ]
    const PathList=[["OrderSummary" ,'Order Summary']]
    return(
        <div>
            <PathShower pathList={PathList}/>
            <div className="flex flex-column">
                <div>
                    <ShowStockReport stockData={stockData}/>
                    <ShowProdPricing productDetails={ProductDetails}/>
                </div>
                <ShowDeliveryUpdate deliveryDetails={DeliveryDetails}/>
            </div>
        </div>
    )
}
