import { useRouter } from 'next/navigation';

export default function StockReport({ stockData }) {
    const router = useRouter();
    return (
        <div className="text-gray-700 font-bold bg-white h-65 w-200 shadow-sm rounded-sm m-3 p-2">
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
                    {stockData.length > 0 ? (
                        <tbody>
                            {stockData.slice(0, 5).map((row, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.item}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.quantity}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.price}</td>
                                    <td className={`px-4 py-2  ${
                                        row.status === "In Stock"
                                            ? "text-green-600"
                                            : row.status === "Low Stock"
                                                ? "text-yellow-500"
                                                : "text-red-500"
                                    }`}>
                                        {row.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : (
                        <tbody>
                            <tr>
                                <td colSpan="4" className="text-center py-8">No Data Available</td>
                            </tr>
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}
