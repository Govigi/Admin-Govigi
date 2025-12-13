"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { getVendors, deleteVendor } from "../../libs/vendorService";

interface Vendor {
    _id: string;
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    isActive: boolean;
    address?: { formattedAddress: string };
}

export default function VendorListPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getVendors();
            setVendors(data);
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this vendor?")) {
            try {
                await deleteVendor(id);
                fetchVendors();
            } catch (error) {
                console.error("Failed to delete vendor", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-mono text-gray-900">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-gray-900">Vendors</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                        Manage Suppliers & Partners
                    </p>
                </div>
                <button
                    onClick={() => router.push("/vendors/input")}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-none hover:bg-gray-800 transition-colors uppercase text-xs tracking-wider"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-gray-400 text-sm animate-pulse">
                        LOADING VENDORS...
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 text-sm py-12 border border-dashed border-gray-200">
                        NO VENDORS FOUND
                    </div>
                ) : (
                    vendors.map((vendor) => (
                        <div
                            key={vendor._id}
                            className="border border-gray-200 p-4 hover:border-gray-800 transition-colors group relative bg-white"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{vendor.businessName}</h3>
                                    <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                                        {vendor.contactPerson}
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${vendor.isActive
                                        ? "text-green-700 border-green-200 bg-green-50"
                                        : "text-gray-500 border-gray-200 bg-gray-50"
                                        }`}
                                >
                                    {vendor.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="space-y-1 mt-4 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs uppercase">Phone</span>
                                    <span className="font-medium text-black">{vendor.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs uppercase">Email</span>
                                    <span className="font-medium text-black">{vendor.email}</span>
                                </div>
                                {vendor.address?.formattedAddress && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-gray-400 text-xs uppercase block mb-1">Address</span>
                                        <span className="text-xs block leading-relaxed text-gray-800 truncate">
                                            {vendor.address.formattedAddress}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white pl-2">
                                <button
                                    onClick={() => router.push(`/vendors/input?id=${vendor._id}`)}
                                    className="text-gray-600 hover:text-black p-1 border border-gray-200 hover:border-black"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => router.push(`/vendors/input?id=${vendor._id}&mode=view`)}
                                    className="text-blue-600 hover:text-blue-900 p-1 border border-gray-200 hover:border-blue-600"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(vendor._id)}
                                    className="text-red-600 hover:text-red-900 p-1 border border-gray-200 hover:border-red-600"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
