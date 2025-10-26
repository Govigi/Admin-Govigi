import React from "react";
import { useRouter } from "next/navigation";

export default function DeliveryUpdate({ deliveryDetails, loading }) {
  const router = useRouter();
  return (
    <div className="text-gray-700 font-bold bg-white h-135 w-100 shadow-sm rounded-sm m-3 p-2">
      <div className="flex m-3 justify-between items-center">
        <p className="text-sm">Delivery Status and Updates</p>
        <p
          className="text-sm text-blue-600 cursor-pointer font-thin"
          onClick={() => router.push("/Ordersummary/showDeliverysts")}
        >
          View all
        </p>
      </div>
      <div
        className="overflow-x-auto"
        style={{ maxHeight: "460px", overflowY: "auto" }}
      >
        <table className="min-w-full text-xs text-left text-gray-700 border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 ">Delivery Status</th>
              <th className="px-4 py-2 ">Message</th>
              <th className="px-4 py-2 ">Time Stamp</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={6} className="text-center py-6">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-4 border-gray-500  border-dotted rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : deliveryDetails.length > 0 ? (
            <tbody>
              {deliveryDetails.slice(0, 6).map((row, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="px-4 py-2 border-r-1 border-gray-200 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                    {row.status}
                  </td>
                  <td className="px-4 py-2 border-r-1 border-gray-200 whitespace-pre-line max-w-[220px] overflow-hidden text-ellipsis">
                    {row.address &&
                    row.address[0] &&
                    (row.address[0].city ||
                      row.address[0].landmark ||
                      row.address[0].name ||
                      row.address[0].contact)
                      ? `At ${row.address[0]?.city ? row.address[0].city : ""}${
                          row.address[0]?.city && row.address[0]?.landmark
                            ? ", land mark "
                            : ""
                        }${
                          row.address[0]?.landmark
                            ? row.address[0].landmark
                            : ""
                        }${
                          (row.address[0]?.city || row.address[0]?.landmark) &&
                          row.address[0]?.name
                            ? "\n name "
                            : ""
                        }${row.address[0]?.name ? row.address[0].name : ""}${
                          row.address[0]?.contact
                            ? " contact " + row.address[0].contact
                            : ""
                        }`
                      : ""}
                  </td>
                  <td className="px-4 py-2 border-r-1 border-gray-200 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                    {row.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No Data Available
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
