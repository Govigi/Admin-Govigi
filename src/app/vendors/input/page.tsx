"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createVendor, getVendorById, updateVendor } from "../../../libs/vendorService";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const InputField = ({ label, value, onChange, type = "text", required = false, name, disabled = false }: any) => (
    <div className="mb-4">
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">{label} {required && "*"}</label>
        <input
            type={type}
            name={name}
            required={required}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-mono ${disabled ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
            placeholder={disabled ? "" : `ENTER ${label}`}
        />
    </div>
);

function VendorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const mode = searchParams.get("mode");
    const isEditMode = !!id;
    const isViewMode = mode === "view";

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: {
            formattedAddress: "",
            components: {
                houseNumber: "",
                street: "",
                area: "",
                city: "",
                state: "",
                postalCode: "",
                country: "India",
            },
            location: {
                type: "Point",
                coordinates: [0, 0],
            },
        },
        bankDetails: {
            accountName: "",
            accountNumber: "",
            bankName: "",
            ifscCode: "",
        },
        isActive: true,
    });

    useEffect(() => {
        if (isEditMode) {
            fetchVendorDetails(id);
        }
    }, [id, isEditMode]);

    const fetchVendorDetails = async (vendorId: string) => {
        try {
            const data = await getVendorById(vendorId);
            setFormData({
                ...data,
                address: { ...formData.address, ...data.address, components: { ...formData.address.components, ...data.address?.components } },
                bankDetails: { ...formData.bankDetails, ...data.bankDetails },
            });
        } catch (error) {
            console.error("Error fetching vendor details", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeepChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleAddressComponentChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            address: {
                ...prev.address,
                components: {
                    ...prev.address.components,
                    [field]: value
                }
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { components } = formData.address;
        const formatted = `${components.houseNumber}, ${components.street}, ${components.area}, ${components.city}, ${components.state} - ${components.postalCode}`;
        const payload = {
            ...formData,
            address: {
                ...formData.address,
                formattedAddress: formData.address.formattedAddress || formatted,
            }
        };

        try {
            if (isEditMode) {
                await updateVendor(id, payload);
            } else {
                await createVendor(payload);
            }
            router.push("/vendors");
        } catch (error) {
            console.error("Error saving vendor", error);
            alert("Failed to save vendor.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-mono text-gray-900 w-full">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-black mb-6">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Vendors
            </button>

            <h1 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-gray-200 pb-4">
                {isViewMode ? "Vendor Details" : isEditMode ? "Edit Vendor Details" : "Onboard New Vendor"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Business Info Section */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        01. Business Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <InputField label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} required disabled={isViewMode} />
                        <InputField label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required disabled={isViewMode} />
                        <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isViewMode} />
                        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required disabled={isViewMode} />
                    </div>
                </div>

                {/* Address Section */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        02. Location Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <InputField label="House / Building" value={formData.address.components.houseNumber} onChange={(e: any) => handleAddressComponentChange("houseNumber", e.target.value)} disabled={isViewMode} />
                        <InputField label="Street / Road" value={formData.address.components.street} onChange={(e: any) => handleAddressComponentChange("street", e.target.value)} disabled={isViewMode} />
                        <InputField label="Area / Colony" value={formData.address.components.area} onChange={(e: any) => handleAddressComponentChange("area", e.target.value)} disabled={isViewMode} />
                        <InputField label="City" value={formData.address.components.city} onChange={(e: any) => handleAddressComponentChange("city", e.target.value)} disabled={isViewMode} />
                        <InputField label="State" value={formData.address.components.state} onChange={(e: any) => handleAddressComponentChange("state", e.target.value)} disabled={isViewMode} />
                        <InputField label="Postal Code" value={formData.address.components.postalCode} onChange={(e: any) => handleAddressComponentChange("postalCode", e.target.value)} disabled={isViewMode} />
                    </div>
                </div>

                {/* Banking Section */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        03. Banking Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <InputField label="Bank Name" value={formData.bankDetails.bankName} onChange={(e: any) => handleDeepChange("bankDetails", "bankName", e.target.value)} disabled={isViewMode} />
                        <InputField label="Account Number" value={formData.bankDetails.accountNumber} onChange={(e: any) => handleDeepChange("bankDetails", "accountNumber", e.target.value)} disabled={isViewMode} />
                        <InputField label="Account Holder Name" value={formData.bankDetails.accountName} onChange={(e: any) => handleDeepChange("bankDetails", "accountName", e.target.value)} disabled={isViewMode} />
                        <InputField label="IFSC Code" value={formData.bankDetails.ifscCode} onChange={(e: any) => handleDeepChange("bankDetails", "ifscCode", e.target.value)} disabled={isViewMode} />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 text-xs uppercase tracking-widest border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        {isViewMode ? "Back" : "Cancel"}
                    </button>
                    {!isViewMode && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Saving..." : isEditMode ? "Update Vendor" : "Create Vendor"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default function VendorFormPage() {
    return (
        <Suspense fallback={<div className="font-mono text-center p-12 text-xs">LOADING FORM...</div>}>
            <VendorForm />
        </Suspense>
    )
}
