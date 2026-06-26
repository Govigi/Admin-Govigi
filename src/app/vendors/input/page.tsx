"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createVendor, getVendorById, updateVendor, getCategories } from "../../../libs/vendorService";
import { ArrowLeftIcon, BuildingStorefrontIcon, CreditCardIcon, ShieldCheckIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import ServiceRangeSelector from "@/src/components/ServiceRangeSelector";
import MapPickerModal from "@/src/components/MapPickerModal";
import { 
    PrimeCard, 
    PrimeInput, 
    PrimeSelect, 
    PrimeSwitch, 
    PrimeBadge, 
    PrimeButton, 
    PrimeDetailRow 
} from "@/src/components/PrimeUI";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

function VendorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const mode = searchParams.get("mode");
    const isEditMode = !!id;
    const isViewMode = mode === "view";

    // Refs for File Inputs
    const logoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const livenessInputRef = useRef<HTMLInputElement>(null);
    const storeImagesInputRef = useRef<HTMLInputElement>(null);

    // States for local upload previews
    const [logoPreview, setLogoPreview] = useState("");
    const [docPreview, setDocPreview] = useState("");
    const [livenessPreview, setLivenessPreview] = useState("");

    // Tab controller state (Restored)
    const [activeTab, setActiveTab] = useState(0); // 0: Business Info, 1: Payout & Compliance, 2: Location & Range

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState("");
    const [showMap, setShowMap] = useState(false);
    
    const [formData, setFormData] = useState({
        vendorCode: "", 
        businessName: "", 
        contactPerson: "", 
        email: "", 
        mobileNumber: "",
        alternatePhone: "",
        role: "Owner",
        businessType: "Retailer",
        legalEntityType: "",
        legalBusinessName: "",
        businessCategory: "",
        address: {
            formattedAddress: "",
            components: { houseNumber: "", street: "", area: "", city: "", state: "", postalCode: "", country: "India" },
            location: { type: "Point", coordinates: [0, 0] },
        },
        agree1: true,
        agree2: true,
        bankDetails: { accountName: "", accountNumber: "", bankName: "", ifscCode: "" },
        isActive: true, isVerified: false,
        serviceHexagons: [] as string[], supportedCategories: [] as string[],
        image: null as any, storeImages: [] as any[], document: null as any, profileImage: null as any,
        gstin: "", panNumber: "", fssaiNumber: "", rating: 0,
    });

    // Unified Document, Logo, Liveness & Gallery Upload Handler
    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (type === "logo") {
            const file = files[0];
            setFormData(prev => ({ ...prev, image: file }));
            setLogoPreview(URL.createObjectURL(file));
        } else if (type === "document") {
            const file = files[0];
            setFormData(prev => ({ ...prev, document: file }));
            setDocPreview(URL.createObjectURL(file));
        } else if (type === "faceLiveness") {
            const file = files[0];
            setFormData(prev => ({ ...prev, profileImage: file })); // Mapped to profileImage
            setLivenessPreview(URL.createObjectURL(file));
        } else if (type === "storeImages") {
            const fileList = Array.from(files);
            setFormData(prev => ({
                ...prev,
                storeImages: [...(prev.storeImages || []), ...fileList]
            }));
        }
    };

    // Helper to render previews for existing URLs (backend) or newly uploaded File objects (frontend)
    const getPreviewUrl = (fieldValue: any, localPreviewState: string) => {
        if (localPreviewState) return localPreviewState;
        if (fieldValue && typeof fieldValue === "object" && fieldValue.url) return fieldValue.url;
        if (typeof fieldValue === "string") return fieldValue;
        return null;
    };

    useEffect(() => {
        if (isEditMode) fetchVendorDetails(id);
        fetchCategories();
    }, [id, isEditMode]);

    const fetchVendorDetails = async (vendorId: string) => {
        setLoading(true);
        try {
            const data = await getVendorById(vendorId);
            setFormData(prev => ({
                ...prev, ...data,
                address: { ...prev.address, ...data.address, location: { type: "Point", coordinates: data.address?.location?.coordinates ?? [0, 0] }, components: { ...prev.address.components, ...data.address?.components } },
                bankDetails: { ...prev.bankDetails, ...data.bankDetails },
                storeImages: data.storeImages || [],
            }));
        } catch (error) { console.error("Error fetching vendor details", error); }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(Array.isArray(data) ? data.map((c: any) => c.categoryName) : [] as any);
        } catch (error) { console.error("Error fetching categories", error); }
    };

    const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDeepChange = (section: string, field: string, value: any) => setFormData((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    const handleAddressComponentChange = (field: string, value: string) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, components: { ...prev.address.components, [field]: value } } }));

    const handleMapConfirm = (loc: any) => setFormData((prev: any) => ({
        ...prev, address: { ...prev.address, formattedAddress: loc.formattedAddress, location: loc.location, components: { ...prev.address.components, ...loc.components } }
    }));

    const handleStatusToggle = async (field: "isVerified" | "isActive", value: boolean) => {
        const updated = { ...formData, [field]: value };
        if (field === "isVerified" && value) updated.isActive = true;
        setFormData(updated);
        if (id) {
            setSaving(field);
            try { await updateVendor(id, updated); } catch { alert("Failed to update status."); setFormData(formData); }
            finally { setSaving(""); }
        }
    };

    const removeStoreImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            storeImages: prev.storeImages.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        const { components } = formData.address;
        const formatted = `${components.houseNumber}, ${components.street}, ${components.area}, ${components.city}, ${components.state} - ${components.postalCode}`;
        const payload = { ...formData, address: { ...formData.address, formattedAddress: formData.address.formattedAddress || formatted } };
        try {
            if (isEditMode){
                await updateVendor(id, payload);
            }
            else{
                await createVendor(payload);
            }
            router.push("/vendors");
        } catch (error){
             console.error("Error submitting vendor profile", error);
        }
        finally { setLoading(false); }
    };

    if (loading && !formData.businessName) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-gray-500 tracking-wide animate-pulse">Loading vendor data...</span>
                </div>
            </div>
        );
    }

    // Resolving Previews with the helper
    const profileImgUrl = getPreviewUrl(formData.image, logoPreview);
    const docUrl = getPreviewUrl(formData.document, docPreview);
    const livenessImgUrl = getPreviewUrl(formData.profileImage, livenessPreview);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-800 w-full">
            <MapPickerModal isOpen={showMap} onClose={() => setShowMap(false)} onConfirm={handleMapConfirm} apiKey={GOOGLE_MAPS_API_KEY} />

            {/* Breadcrumb / Action Row */}
            <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#10b981] transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Vendors
                </button>
                {isViewMode && (
                    <PrimeButton onClick={() => router.push(`/vendors/input?id=${id}`)} severity="primary">
                        Edit Profile
                    </PrimeButton>
                )}
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Profile Header Summary Card */}
                <div className="lg:col-span-12">
                    <PrimeCard className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            {profileImgUrl ? (
                                <img src={profileImgUrl} alt="Store logo" className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 bg-[#10b981] text-white rounded-md flex items-center justify-center text-xl font-bold shadow-sm">
                                    {(formData.businessName || "V").substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900">{formData.businessName || "New Onboarding"}</h1>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded border border-gray-200">
                                        {formData.vendorCode || "NO CODE"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    {formData.businessType} &bull; {formData.legalEntityType || "No Legal Entity"} &bull; {formData.businessCategory || "No Category"}
                                </p>
                            </div>
                        </div>

                        {/* Status Control Strip */}
                        <div className="flex flex-wrap items-center gap-6 bg-gray-50 border border-gray-200 rounded-md px-5 py-3.5 w-full md:w-auto">
                            {/* Approval Toggle */}
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approval Status</div>
                                    <div className="mt-0.5">
                                        {saving === "isVerified" ? (
                                            <span className="text-xs font-semibold text-gray-500">Saving...</span>
                                        ) : (
                                            <PrimeBadge 
                                                value={formData.isVerified ? "Approved" : "Pending"} 
                                                severity={formData.isVerified ? "success" : "warning"} 
                                            />
                                        )}
                                    </div>
                                </div>
                                <PrimeSwitch checked={formData.isVerified} onChange={(val) => handleStatusToggle("isVerified", val)} />
                            </div>

                            <div className="hidden md:block w-px h-8 bg-gray-200" />

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Access</div>
                                    <div className="mt-0.5">
                                        {saving === "isActive" ? (
                                            <span className="text-xs font-semibold text-gray-500">Saving...</span>
                                        ) : (
                                            <PrimeBadge 
                                                value={formData.isActive ? "Active" : "Suspended"} 
                                                severity={formData.isActive ? "success" : "danger"} 
                                            />
                                        )}
                                    </div>
                                </div>
                                <PrimeSwitch checked={formData.isActive} onChange={(val) => handleStatusToggle("isActive", val)} />
                            </div>

                            {!isViewMode && (
                                <>
                                    <div className="hidden md:block w-px h-8 bg-gray-200" />
                                    <PrimeButton onClick={() => handleSubmit()} disabled={loading} severity="success" className="px-5 py-1.5 text-xs">
                                        Save
                                    </PrimeButton>
                                </>
                            )}
                        </div>
                    </PrimeCard>
                </div>

                {/* Left Main Content Column (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200 bg-gray-50/50">
                            {[
                                { label: "Business Details", icon: BuildingStorefrontIcon },
                                { label: "Payout & KYC", icon: CreditCardIcon },
                                { label: "Location & Coverage", icon: ShieldCheckIcon }
                            ].map((tab, idx) => {
                                const TabIcon = tab.icon;
                                const isActive = activeTab === idx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveTab(idx)}
                                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all focus:outline-none ${
                                            isActive ? "border-[#10b981] text-[#059669] bg-white font-bold" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                                        }`}
                                    >
                                        <TabIcon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Panels */}
                        <div className="p-6">
                            {/* Tab 0: Business Info */}
                            {activeTab === 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">General Profile</h3>
                                    {isViewMode ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                            <PrimeDetailRow label="Legal Business Name" value={formData.legalBusinessName} />
                                            <PrimeDetailRow label="Representative / Contact Name" value={formData.contactPerson} />
                                            <PrimeDetailRow label="Email Address" value={formData.email} />
                                            <PrimeDetailRow label="Phone Number" value={formData.mobileNumber} />
                                            <PrimeDetailRow label="Alternate Phone" value={formData.alternatePhone} />
                                            <PrimeDetailRow label="Designation / Role" value={formData.role} />
                                            <PrimeDetailRow label="Business Type" value={formData.businessType} />
                                            <PrimeDetailRow label="Category" value={formData.businessCategory} />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <PrimeInput label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} required />
                                            <PrimeInput label="Legal Business Name" name="legalBusinessName" value={formData.legalBusinessName} onChange={handleChange} />
                                            <PrimeInput label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
                                            <PrimeInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                                            <PrimeInput label="Phone Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
                                            <PrimeInput label="Alternate Phone" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} />
                                            <PrimeSelect label="Designation / Role" name="role" value={formData.role} onChange={handleChange}
                                                options={[{ value: "Owner", label: "Owner" }, { value: "Manager", label: "Manager" }]} />
                                            <PrimeSelect label="Business Type" name="businessType" value={formData.businessType} onChange={handleChange}
                                                options={[{ value: "Retailer", label: "Retailer" }, { value: "Wholesaler", label: "Wholesaler" }]} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 1: Payout & Compliance */}
                            {activeTab === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">KYC Documents</h3>
                                        {isViewMode ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <PrimeDetailRow label="GSTIN Number" value={formData.gstin} />
                                                <PrimeDetailRow label="PAN Card Number" value={formData.panNumber} />
                                                <PrimeDetailRow label="FSSAI License Number" value={formData.fssaiNumber} />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <PrimeInput label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} />
                                                <PrimeInput label="PAN Card" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                                                <PrimeInput label="FSSAI License" name="fssaiNumber" value={formData.fssaiNumber} onChange={handleChange} />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Payout Account</h3>
                                        {isViewMode ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                                <PrimeDetailRow label="Bank Name" value={formData.bankDetails.bankName} />
                                                <PrimeDetailRow label="Account Number" value={formData.bankDetails.accountNumber} />
                                                <PrimeDetailRow label="Account Holder Name" value={formData.bankDetails.accountName} />
                                                <PrimeDetailRow label="IFSC Code" value={formData.bankDetails.ifscCode} />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <PrimeInput label="Bank Name" value={formData.bankDetails.bankName} onChange={(e: any) => handleDeepChange("bankDetails", "bankName", e.target.value)} />
                                                <PrimeInput label="Account Number" value={formData.bankDetails.accountNumber} onChange={(e: any) => handleDeepChange("bankDetails", "accountNumber", e.target.value)} />
                                                <PrimeInput label="Account Holder Name" value={formData.bankDetails.accountName} onChange={(e: any) => handleDeepChange("bankDetails", "accountName", e.target.value)} />
                                                <PrimeInput label="IFSC Code" value={formData.bankDetails.ifscCode} onChange={(e: any) => handleDeepChange("bankDetails", "ifscCode", e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Location & Range */}
                            {activeTab === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Store Coordinates</h3>
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Registered Map Location</span>
                                                <p className="text-xs font-semibold text-gray-700 leading-relaxed mt-1">{formData.address.formattedAddress || "No location coordinates chosen"}</p>
                                            </div>
                                            {!isViewMode && (
                                                <PrimeButton type="button" onClick={() => setShowMap(true)} severity="secondary" className="text-xs px-3 py-1.5">
                                                    Select Location
                                                </PrimeButton>
                                            )}
                                        </div>
                                        {!isViewMode && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <PrimeInput label="Area / Locality" value={formData.address.components.area} onChange={(e: any) => handleAddressComponentChange("area", e.target.value)} />
                                                <PrimeInput label="Street Address / Landmark" value={formData.address.components.street} onChange={(e: any) => handleAddressComponentChange("street", e.target.value)} />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Service Delivery Range</h3>
                                        {(formData.address.location?.coordinates?.[0] ?? 0) !== 0 ? (
                                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                                <ServiceRangeSelector
                                                    center={{ lat: formData.address.location.coordinates[1], lng: formData.address.location.coordinates[0] }}
                                                    selectedHexagons={formData.serviceHexagons}
                                                    onChange={(hexagons) => setFormData(prev => ({ ...prev, serviceHexagons: hexagons }))}
                                                    apiKey={GOOGLE_MAPS_API_KEY}
                                                    readOnly={isViewMode}
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center text-xs text-gray-400 font-medium">
                                                Set map coordinates in the address field first to configure delivery range.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions */}
                        {!isViewMode && (
                            <div className="p-6 bg-gray-50/50 border-t border-gray-200 flex justify-end gap-3">
                                <PrimeButton type="button" onClick={() => router.back()} severity="secondary">
                                    Cancel
                                </PrimeButton>
                                <PrimeButton type="submit" onClick={() => handleSubmit()} disabled={loading} severity="primary">
                                    {loading ? "Saving..." : isEditMode ? "Update Vendor" : "Create Vendor"}
                                </PrimeButton>
                            </div>
                        )}
                    </div>

                    {/* ID Document Card */}
                    <PrimeCard className="p-5">
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheckIcon className="w-4 h-4 text-[#10b981]" />
                                ID Document Verification Image
                            </span>
                            {!isViewMode && (
                                <button 
                                    type="button" 
                                    onClick={() => docInputRef.current?.click()} 
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                >
                                    Choose File
                                </button>
                            )}
                        </h3>
                        <input
                            type="file"
                            accept="image/*"
                            ref={docInputRef}
                            onChange={(e) => handleDocUpload(e, "document")}
                            disabled={isViewMode}
                            className="hidden"
                        />
                        {docUrl ? (
                            <div className="border border-gray-200 rounded overflow-hidden bg-gray-50 p-2">
                                <img src={docUrl} alt="Verification document" className="w-full max-h-[500px] object-contain mx-auto" />
                            </div>
                        ) : (
                            <div className="w-full py-12 bg-gray-50 border border-dashed border-gray-350 rounded flex flex-col items-center justify-center text-xs text-gray-400 font-medium">
                                <PhotoIcon className="w-6 h-6 text-gray-300 mb-1" />
                                No ID Document Uploaded
                            </div>
                        )}
                    </PrimeCard>

                    {/* Face Liveness Verification Card */}
                    <PrimeCard className="p-5 mt-6">
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheckIcon className="w-4 h-4 text-[#10b981]" />
                                Face Liveness / Representative Photo
                            </span>
                            {!isViewMode && (
                                <button 
                                    type="button" 
                                    onClick={() => livenessInputRef.current?.click()} 
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                >
                                    Choose File
                                </button>
                            )}
                        </h3>
                        <input
                            type="file"
                            accept="image/*"
                            ref={livenessInputRef}
                            onChange={(e) => handleDocUpload(e, "faceLiveness")}
                            disabled={isViewMode}
                            className="hidden"
                        />
                        {livenessImgUrl ? (
                            <div className="border border-gray-200 rounded overflow-hidden bg-gray-50 p-2">
                                <img src={livenessImgUrl} alt="Liveness verification" className="w-full max-h-[500px] object-contain mx-auto" />
                            </div>
                        ) : (
                            <div className="w-full py-12 bg-gray-50 border border-dashed border-gray-350 rounded flex flex-col items-center justify-center text-xs text-gray-400 font-medium">
                                <PhotoIcon className="w-6 h-6 text-gray-300 mb-1" />
                                No Liveness Photo Captured
                            </div>
                        )}
                    </PrimeCard>
                </div>

                {/* Right Sidebar Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Categories tag grid */}
                    <PrimeCard className="p-5">
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-3">Supported Categories</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map(cat => {
                                const isSelected = formData.supportedCategories?.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        disabled={isViewMode}
                                        onClick={() => {
                                            const current = formData.supportedCategories || [];
                                            const updated = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
                                            setFormData(prev => ({ ...prev, supportedCategories: updated }));
                                        }}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-all ${
                                            isSelected 
                                                ? "bg-emerald-50 text-[#059669] border-emerald-200" 
                                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                        } ${isViewMode ? "cursor-default" : "cursor-pointer"}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </PrimeCard>

                    {/* Logo upload */}
                    <PrimeCard className="p-5">
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5">
                                <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                                Store Logo
                            </span>
                            {!isViewMode && (
                                <button 
                                    type="button" 
                                    onClick={() => logoInputRef.current?.click()} 
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                >
                                    Upload Logo
                                </button>
                            )}
                        </h3>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={logoInputRef} 
                            onChange={(e) => handleDocUpload(e, "logo")} 
                            className="hidden" 
                            disabled={isViewMode}
                        />
                        {profileImgUrl ? (
                            <img src={profileImgUrl} alt="Store logo" className="w-full aspect-square object-cover rounded border border-gray-200 shadow-sm" />
                        ) : (
                            <div className="w-full aspect-square bg-gray-50 border border-dashed border-gray-350 rounded flex flex-col items-center justify-center text-xs text-gray-400 font-medium">
                                <PhotoIcon className="w-6 h-6 text-gray-300 mb-1" />
                                No Logo Uploaded
                            </div>
                        )}
                    </PrimeCard>

                    {/* Store Images Gallery */}
                    <PrimeCard className="p-5">
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5">
                                <PhotoIcon className="w-4 h-4 text-gray-400" />
                                Store Gallery
                            </span>
                            {!isViewMode && (
                                <button 
                                    type="button" 
                                    onClick={() => storeImagesInputRef.current?.click()} 
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                >
                                    Add Images
                                </button>
                            )}
                        </h3>
                        <input 
                            type="file"
                            accept="image/*"
                            multiple
                            ref={storeImagesInputRef}
                            onChange={(e) => handleDocUpload(e, "storeImages")}
                            disabled={isViewMode}
                            className="hidden"
                        />
                        
                        {formData.storeImages && formData.storeImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {formData.storeImages.map((img: any, idx: number) => {
                                    // Handle dynamic previews for existing items or newly-added Local File objects
                                    let src = "";
                                    if (img instanceof File) {
                                        src = URL.createObjectURL(img);
                                    } else if (img && typeof img === "object" && img.url) {
                                        src = img.url;
                                    } else if (typeof img === "string") {
                                        src = img;
                                    }

                                    return src ? (
                                        <div key={idx} className="relative group aspect-square rounded overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                            <img src={src} alt={`Store gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                            {!isViewMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeStoreImage(idx)}
                                                    className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white"
                                                    title="Remove Image"
                                                >
                                                    <TrashIcon className="w-5 h-5 text-rose-400" />
                                                </button>
                                            )}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <div className="w-full py-8 bg-gray-50 border border-dashed border-gray-350 rounded flex flex-col items-center justify-center text-xs text-gray-400 font-medium">
                                <PhotoIcon className="w-6 h-6 text-gray-300 mb-1" />
                                No Gallery Images
                            </div>
                        )}
                    </PrimeCard>
                </div>
            </div>
        </div>
    );
}

export default function VendorFormPage() {
    return (
        <Suspense fallback={<div className="font-sans text-center p-12 text-sm text-gray-500">Loading form...</div>}>
            <VendorForm />
        </Suspense>
    );
}