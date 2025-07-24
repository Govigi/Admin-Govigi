import { useRouter } from 'next/navigation';

export default function ProductPricing({ productDetails }) {
    const router = useRouter();
    return (
        <div className="text-gray-700 font-bold bg-white h-65 w-200 shadow-sm rounded-sm m-3 p-2">
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
                    {productDetails.length > 0 ? (
                        <tbody>
                            {productDetails.slice(0, 5).map((row, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.item}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.price}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.type}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">
                                        {row.aval === "stock" ? "✅" : "❌"}
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
