"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ArrowLeftIcon, MapPinIcon } from "@heroicons/react/24/outline";
import MapPickerModal from "@/src/components/MapPickerModal";
import MapSnapshot from "@/src/components/MapSnapshot";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CustomerManagementUrl,
  CustomerTypesUrl,
} from "@/src/libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
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

function CustomerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isEditMode = !!id;
  const isViewMode = mode === "view";

  const { showLoader, hideLoader } = useLoading();

  const [showMap, setShowMap] = useState(false);
  const [mapAddressData, setMapAddressData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerCity: "",
    customerState: "",
    customerCountry: "India",
    customerZip: "",
    customerType: "",
    customerTypeObject: null as any,
    customerContactPerson: "",
    customerContactPersonNumber: "",
    customerStatus: "active",
    joinedOn: "",
  });

  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchTypes();
    if (isEditMode) {
      fetchCustomerDetails(id);
    }
  }, [id, isEditMode]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      showLoader("Loading details...");
      const response = await fetch(`${CustomerManagementUrl.getCustomerById}/${customerId}`);
      const data = await response.json();

      if (data) {
        const addressObj = typeof data.customerAddress === 'object' ? data.customerAddress : null;

        setFormData({
          customerName: data.customerName || "",
          customerEmail: data.customerEmail || "",
          customerPhone: data.customerPhone || "",
          customerAddress: addressObj?.formattedAddress || "",
          customerCity: addressObj?.components?.city || "",
          customerState: addressObj?.components?.state || "",
          customerCountry: addressObj?.components?.country || "India",
          customerZip: addressObj?.components?.postalCode || "",
          customerType: data.customerType?._id || data.customerType || "",
          customerTypeObject: data.customerType,
          customerContactPerson: data.customerContactPerson || "",
          customerContactPersonNumber: data.customerContactPersonNumber || "",
          customerStatus: data.customerStatus || "active",
          joinedOn: data.joinedOn || "",
        });

        if (addressObj) {
          setMapAddressData({ ...addressObj });
        }
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
    } finally {
      hideLoader();
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch(CustomerTypesUrl.getAllTypes);
      const data = await response.json();
      const typesArray = data?.types || data || [];
      const simplifiedTypes = typesArray.map((type: any) => ({
        id: type._id,
        name: type.typeName,
      }));
      setTypes(simplifiedTypes);
    } catch (error) {
      console.error("Error fetching customer types:", error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapConfirm = (locationData: any) => {
    setMapAddressData(locationData);
    setFormData(prev => ({
      ...prev,
      customerAddress: locationData.formattedAddress,
      customerCity: locationData.components.city || "",
      customerState: locationData.components.state || "",
      customerZip: locationData.components.postalCode || "",
      customerCountry: locationData.components.country || "India",
    }));
  };

  const handleStatusToggle = async (status: "active" | "inactive") => {
    const updated = { ...formData, customerStatus: status };
    setFormData(updated);
    if (isViewMode && id) {
      setSaving(true);
      try {
        const url = `${CustomerManagementUrl.updateCustomer}/${id}`;
        const payload = {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerContactPerson: formData.customerContactPerson,
          customerContactPersonNumber: formData.customerContactPersonNumber,
          customerStatus: status,
          customerType: formData.customerType,
          address: mapAddressData,
        };
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Failed status toggle:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSubmit = (e?: any) => {
    if (e) e.preventDefault();
    showLoader(isEditMode ? "Updating..." : "Creating...");

    const url = isEditMode
      ? `${CustomerManagementUrl.updateCustomer}/${id}`
      : CustomerManagementUrl.createCustomer;

    const method = isEditMode ? "PUT" : "POST";

    const payload = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      customerContactPerson: formData.customerContactPerson,
      customerContactPersonNumber: formData.customerContactPersonNumber,
      customerStatus: formData.customerStatus,
      customerType: formData.customerType,
      address: mapAddressData,
    };

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("Error: " + data.error);
        } else {
          router.push("/customers-dashboard");
        }
      })
      .catch((error) => {
        console.error("Error saving customer:", error);
        alert("Failed to save customer");
      })
      .finally(() => {
        hideLoader();
      });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-800 w-full animate-in fade-in duration-300">
      <MapPickerModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onConfirm={handleMapConfirm}
        apiKey={GOOGLE_MAPS_API_KEY}
      />

      {/* Action Navigation header */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#10b981] transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Users
        </button>
        {isViewMode && (
          <PrimeButton onClick={() => router.push(`/Customers/AddCustomer?id=${id}`)} severity="primary">
            Edit Customer
          </PrimeButton>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer Header summary card */}
        <div className="lg:col-span-12">
          <PrimeCard className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#10b981] text-white rounded-md flex items-center justify-center text-lg font-bold shadow-sm shrink-0">
                {(formData.customerName || "C").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{formData.customerName || "New Customer"}</h1>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Joined on: {formData.joinedOn ? new Date(formData.joinedOn).toLocaleDateString() : "Pending"}
                </p>
              </div>
            </div>

            {/* Quick Status switches */}
            <div className="flex flex-wrap items-center gap-6 bg-gray-50 border border-gray-200 rounded-md px-5 py-3.5 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Status</div>
                  <div className="mt-0.5">
                    {saving ? (
                      <span className="text-xs font-semibold text-gray-500">Saving...</span>
                    ) : (
                      <PrimeBadge 
                        value={formData.customerStatus === "active" ? "Active" : "Inactive"} 
                        severity={formData.customerStatus === "active" ? "success" : "danger"} 
                      />
                    )}
                  </div>
                </div>
                <PrimeSwitch 
                  checked={formData.customerStatus === "active"} 
                  onChange={(checked) => handleStatusToggle(checked ? "active" : "inactive")} 
                />
              </div>

              {!isViewMode && (
                <>
                  <div className="hidden md:block w-px h-8 bg-gray-200" />
                  <PrimeButton onClick={handleSubmit} severity="success" className="px-5 py-1.5 text-xs">
                    Save Changes
                  </PrimeButton>
                </>
              )}
            </div>
          </PrimeCard>
        </div>

        {/* Left Side: General Profile & Address Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Information Card */}
          <PrimeCard>
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-5 flex items-center gap-2">
              General Information
            </h2>
            {isViewMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <PrimeDetailRow label="Customer Name" value={formData.customerName} />
                <PrimeDetailRow label="Email Address" value={formData.customerEmail} />
                <PrimeDetailRow label="Business Phone" value={formData.customerPhone} />
                <PrimeDetailRow label="Contact Person" value={formData.customerContactPerson} />
                <PrimeDetailRow label="Contact Person Number" value={formData.customerContactPersonNumber} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PrimeInput label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
                <PrimeInput label="Email Address" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} required />
                <PrimeInput label="Contact Person" name="customerContactPerson" value={formData.customerContactPerson} onChange={handleChange} />
                <PrimeInput label="Contact Person Number" name="customerContactPersonNumber" value={formData.customerContactPersonNumber} onChange={handleChange} />
                <PrimeInput label="Business Phone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required />
              </div>
            )}
          </PrimeCard>

          {/* Address Details Card */}
          <PrimeCard>
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-5">
              Address & Delivery Details
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-md mb-6 overflow-hidden">
              {!formData.customerAddress ? (
                <div className="text-center py-10 px-6">
                  <MapPinIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-500 mb-4 font-mono">No coordinates mapped yet</p>
                  {!isViewMode && (
                    <PrimeButton onClick={() => setShowMap(true)} severity="secondary" className="text-xs">
                      Set Location on Map
                    </PrimeButton>
                  )}
                </div>
              ) : (
                <div>
                  {mapAddressData?.location?.coordinates && (
                    <div className="w-full h-44 border-b border-gray-200 relative bg-gray-150">
                      <MapSnapshot
                        apiKey={GOOGLE_MAPS_API_KEY}
                        lat={mapAddressData.location.coordinates[1]}
                        lng={mapAddressData.location.coordinates[0]}
                      />
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => setShowMap(true)}
                          className="absolute bottom-3 right-3 bg-white text-gray-800 border border-gray-200 px-3 py-1.5 text-[10px] font-bold rounded shadow-sm hover:bg-gray-50 z-10 transition-colors uppercase tracking-wider"
                        >
                          Change Location
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Formatted Address</span>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed mt-1">{formData.customerAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">City</span>
                        <p className="text-xs font-bold text-gray-800 mt-1">{formData.customerCity || "-"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">State</span>
                        <p className="text-xs font-bold text-gray-800 mt-1">{formData.customerState || "-"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Zip Code</span>
                        <p className="text-xs font-bold text-gray-800 mt-1">{formData.customerZip || "-"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Country</span>
                        <p className="text-xs font-bold text-gray-800 mt-1">{formData.customerCountry || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PrimeCard>
        </div>

        {/* Right Side Settings Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <PrimeCard>
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2.5 mb-4">
              Classification & Settings
            </h3>
            {isViewMode ? (
              <PrimeDetailRow label="Customer Classification" value={formData.customerTypeObject?.typeName || "Standard"} />
            ) : (
              <PrimeSelect
                label="Customer Type"
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                options={types.map(t => ({ value: t.id, label: t.name }))}
              />
            )}
          </PrimeCard>
        </div>

        {/* Bottom Actions for Edit/New Forms */}
        {!isViewMode && (
          <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <PrimeButton onClick={() => router.back()} severity="secondary">
              Cancel
            </PrimeButton>
            <PrimeButton onClick={handleSubmit} severity="primary">
              {isEditMode ? "Save Changes" : "Create Customer"}
            </PrimeButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddCustomerPage() {
  return (
    <Suspense fallback={<div className="font-sans text-center p-12 text-sm text-gray-500">Loading form...</div>}>
      <CustomerForm />
    </Suspense>
  );
}
