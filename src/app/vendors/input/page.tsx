"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createVendor, getVendorById, updateVendor, getCategories } from "../../../libs/vendorService";
import { ArrowLeftIcon, MapPinIcon } from "@heroicons/react/24/outline";
import ServiceRangeSelector from "@/src/components/ServiceRangeSelector";
import MapPickerModal from "@/src/components/MapPickerModal";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

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
            className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-inter ${disabled ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
            placeholder={disabled ? "" : `ENTER ${label}`}
        />
    </div>
);

const ToggleField = ({ label, checked, onChange, disabled = false }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-0.5">{label}</label>
            <p className="text-[10px] text-gray-400 uppercase">Current Status: {checked ? "Active" : "Inactive"}</p>
        </div>
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#10b981]' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

function VendorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const mode = searchParams.get("mode");
    const isEditMode = !!id;
    const isViewMode = mode === "view";

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
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
        isVerified: false,
        serviceHexagons: [] as string[],
        supportedCategories: [] as string[],
    });

    useEffect(() => {
        if (isEditMode) {
            fetchVendorDetails(id);
        }
        fetchCategories();
    }, [id, isEditMode]);

    const fetchVendorDetails = async (vendorId: string) => {
        try {
            const data = await getVendorById(vendorId);
            setFormData({
                ...data,
                address: {
                    ...formData.address,
                    ...data.address,
                    location: {
                        type: "Point",
                        coordinates: data.address?.location?.coordinates ?? [0, 0],
                    },
                    components: { ...formData.address.components, ...data.address?.components },
                },
                bankDetails: { ...formData.bankDetails, ...data.bankDetails },
            });
        } catch (error) {
            console.error("Error fetching vendor details", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            const names = Array.isArray(data) ? data.map((c: any) => c.categoryName) : [];
            setCategories(names as any);
        } catch (error) {
            console.error("Error fetching categories", error);
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

    const handleMapConfirm = (locationData: any) => {
        setFormData((prev: any) => ({
            ...prev,
            address: {
                ...prev.address,
                formattedAddress: locationData.formattedAddress,
                location: locationData.location,
                components: {
                    ...prev.address.components,
                    ...locationData.components, // Auto-fill fields from map
                }
            }
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
            },
            serviceHexagons: formData.serviceHexagons,
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
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900 w-full">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-black mb-6">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Vendors
            </button>

            <h1 className="text-xl font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-4">
                {isViewMode ? "Vendor Details" : isEditMode ? "Edit Vendor Details" : "Onboard New Vendor"}
            </h1>

            {/* Quick Access Status Bar (Top) */}
            {isEditMode && (
                <div className="mb-10 bg-gray-50 border border-gray-200 p-4 rounded-none flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                        <div className="w-full md:w-auto">
                            <ToggleField 
                                label="Verification Status (Approve)" 
                                checked={formData.isVerified} 
                                onChange={(val: boolean) => setFormData(prev => ({ ...prev, isVerified: val, isActive: val || prev.isActive }))}
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <ToggleField 
                                label="Account Activity" 
                                checked={formData.isActive} 
                                onChange={(val: boolean) => setFormData(prev => ({ ...prev, isActive: val }))}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                    
                    {!isViewMode && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-[#10b981] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {loading ? "SAVING..." : "QUICK UPDATE"}
                        </button>
                    )}
                </div>
            )}

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

                {/* Categories Section */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        02. Capability
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Supported Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => {
                                const isSelected = formData.supportedCategories?.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        disabled={isViewMode}
                                        onClick={() => {
                                            if (isViewMode) return;
                                            const current = formData.supportedCategories || [];
                                            const updated = current.includes(cat)
                                                ? current.filter(c => c !== cat)
                                                : [...current, cat];
                                            setFormData(prev => ({ ...prev, supportedCategories: updated }));
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${isSelected
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                                            } ${isViewMode ? "cursor-default opacity-80" : "cursor-pointer"}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div>
                    <MapPickerModal
                        isOpen={showMap}
                        onClose={() => setShowMap(false)}
                        onConfirm={handleMapConfirm}
                        apiKey={GOOGLE_MAPS_API_KEY}
                    />

                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        03. Location Details
                    </h2>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase text-gray-400 font-inter mb-1">Selected Location</p>
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="w-5 h-5 text-black" />
                                    <p className="text-sm font-bold">{formData.address.formattedAddress || "No location selected"}</p>
                                </div>
                            </div>
                            {!isViewMode && (
                                <button
                                    type="button"
                                    onClick={() => setShowMap(true)}
                                    className="bg-black text-white px-4 py-2 text-xs uppercase font-bold tracking-widest hover:bg-gray-800"
                                >
                                    Select on Map
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <InputField
                            label="Area Name"
                            value={formData.address.components.area}
                            onChange={(e: any) => handleAddressComponentChange("area", e.target.value)}
                            disabled={isViewMode}
                            placeholder="ENTER AREA NAME"
                        />
                        <InputField
                            label="Nearby Landmark"
                            value={formData.address.components.street}
                            onChange={(e: any) => handleAddressComponentChange("street", e.target.value)}
                            disabled={isViewMode}
                            placeholder="ENTER LANDMARK"
                        />
                    </div>
                </div>

                {/* Banking Section */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        04. Banking Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <InputField label="Bank Name" value={formData.bankDetails.bankName} onChange={(e: any) => handleDeepChange("bankDetails", "bankName", e.target.value)} disabled={isViewMode} />
                        <InputField label="Account Number" value={formData.bankDetails.accountNumber} onChange={(e: any) => handleDeepChange("bankDetails", "accountNumber", e.target.value)} disabled={isViewMode} />
                        <InputField label="Account Holder Name" value={formData.bankDetails.accountName} onChange={(e: any) => handleDeepChange("bankDetails", "accountName", e.target.value)} disabled={isViewMode} />
                        <InputField label="IFSC Code" value={formData.bankDetails.ifscCode} onChange={(e: any) => handleDeepChange("bankDetails", "ifscCode", e.target.value)} disabled={isViewMode} />
                    </div>
                </div>

                {/* Service Range Section */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                        05. Service Range
                    </h2>

                    {(formData.address.location?.coordinates?.[0] ?? 0) !== 0 ? (
                        <div className="bg-white p-1">
                            <ServiceRangeSelector
                                center={{
                                    lat: formData.address.location.coordinates[1],
                                    lng: formData.address.location.coordinates[0]
                                }}
                                selectedHexagons={formData.serviceHexagons}
                                onChange={(hexagons) => setFormData(prev => ({ ...prev, serviceHexagons: hexagons }))}
                                apiKey={GOOGLE_MAPS_API_KEY}
                                readOnly={isViewMode}
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 p-8 text-center rounded-lg">
                            <p className="text-sm font-inter text-gray-400">Please select a valid location in the address section first to enable service range selection.</p>
                        </div>
                    )}
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
