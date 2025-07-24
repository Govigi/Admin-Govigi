import { useRouter } from 'next/navigation';

export default function DeliveryUpdate({ deliveryDetails }) {
    const router = useRouter();
    return (
        <div className="text-gray-700 font-bold bg-white h-130 w-100 shadow-sm rounded-sm m-3 p-2">
            <div className="flex m-3 justify-between items-center">
                <p className="text-sm">Delivery Status and Updates</p>
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
                    {deliveryDetails.length > 0 ? (
                        <tbody>
                            {deliveryDetails.slice(0, 10).map((row, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.deliveryStatus}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.message}</td>
                                    <td className="px-4 py-2 border-r-1 border-gray-200">{row.timeStamp}</td>
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
