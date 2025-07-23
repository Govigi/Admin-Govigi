'use client';
import PathShower from "@/components/pathShower";
import { useRouter } from 'next/navigation'; 
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
    const ShowStockReport = () =>{
        return <div className="text-gray-700 font-bold bg-white h-65 w-170 shadow-sm rounded-sm m-3 p-2">
                <div className="flex m-3 justify-between items-center">
                    <p className="text-sm">Stock Report</p>
                    <p className="text-sm text-blue-600 cursor-pointer font-thin"
                    onClick={() => router.push("/Ordersummary/stockReport")}>View all</p>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-700 border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 ">Product Name</th>
                            <th className="px-4 py-2 ">Current Stock</th>
                            <th className="px-4 py-2 ">Minimum Threshold</th>
                            <th className="px-4 py-2 ">Stock Status</th>
                        </tr>
                    </thead>
                    {stockData.length>0?
                        <tbody>
                            {stockData.slice(0,5).map((row, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.item}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.quantity}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.price}</td>
                                <td
                                className={`px-4 py-2  ${
                                    row.status === "In Stock"
                                    ? "text-green-600"
                                    : row.status === "Low Stock"
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}
                                >
                                {row.status}
                                </td>
                            </tr>
                            ))}
                        </tbody>:<tbody>
                            <tr>
                                <td colSpan="4" className="text-center py-8">No Data Available</td>
                            </tr>
                            </tbody>}
                </table>
                </div>
            </div>
    }
    const ShowProdPricing = () =>{
        return <div className="text-gray-700 font-bold bg-white h-65 w-170 shadow-sm rounded-sm m-3 p-2">
                <div className="flex m-3 justify-between items-center">
                    <p className="text-sm">Products and Pricing</p>
                    <p className="text-sm text-blue-600 cursor-pointer font-thin"
                    onClick={() => router.push("/Ordersummary/showPricing")}>View all</p>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-700 border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 ">Name</th>
                            <th className="px-4 py-2 ">Price</th>
                            <th className="px-4 py-2 ">Unit Type</th>
                            <th className="px-4 py-2 ">Availability</th>
                        </tr>
                    </thead>
                    {ProductDetails.length>0?
                        <tbody>
                            {ProductDetails.slice(0,5).map((row, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.item}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.price}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.type}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">
                                {row.aval=="stock"? "✅" : "❌"}
                                </td>
                            </tr>
                            ))}
                        </tbody>:<tbody>
                            <tr>
                                <td colSpan="4" className="text-center py-8">No Data Available</td>
                            </tr>
                            </tbody>}
                </table>
                </div>
            </div>
    }
    const ShowDeliveryUpdate = () =>{
        return <div className="text-gray-700 font-bold bg-white h-130 w-100 shadow-sm rounded-sm m-3 p-2">
                <div className="flex m-3 justify-between items-center">
                    <p className="text-sm">Products and Pricing</p>
                    <p className="text-sm text-blue-600 cursor-pointer font-thin"
                    onClick={() => router.push("/Ordersummary/stockReport")}>View all</p>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-700 border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 ">Delivery Status</th>
                            <th className="px-4 py-2 ">Message</th>
                            <th className="px-4 py-2 ">Time Stamp</th>
                        </tr>
                    </thead>
                    {DeliveryDetails.length>0?
                        <tbody>
                            {DeliveryDetails.slice(0,10).map((row, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.deliveryStatus}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.message}</td>
                                <td className="px-4 py-2 border-r-1 border-gray-200">{row.timeStamp}</td>
                            </tr>
                            ))}
                        </tbody>:<tbody>
                            <tr>
                                <td colSpan="4" className="text-center py-8">No Data Available</td>
                            </tr>
                            </tbody>}
                </table>
                </div>
            </div>
    }
    const PathList=[["OrderSummary" ,'Order Summary']]
    return(
        <div>
            <PathShower pathList={PathList}/>
            <div className="flex flex-column">
                <div>
                    <ShowStockReport/>
                    <ShowProdPricing/>
                </div>
                <ShowDeliveryUpdate/>
            </div>
        </div>
    )
}
