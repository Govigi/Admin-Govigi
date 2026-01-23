"use client";

import React from "react";
import { ArrowLeftIcon, MapPinIcon } from "@heroicons/react/24/outline";
import MapPickerModal from "@/src/components/MapPickerModal";
import MapSnapshot from "@/src/components/MapSnapshot";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CustomerManagementUrl,
  CustomerTypesUrl,
  StatesAndCitiesUrl,
} from "@/src/libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";

// Replace with your actual API Key or process.env variable
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function AddCustomer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isEditMode = !!id;
  const isViewMode = mode === "view";

  const { showLoader, hideLoader } = useLoading();

  const [showMap, setShowMap] = useState(false);
  const [mapAddressData, setMapAddressData] = useState<any>(null);

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
    customerTypeObject: null,
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

        // Store existing address object if needed for updates (schema might differ slightly but useful)
        if (addressObj) {
          setMapAddressData({
            ...addressObj,
            // Ensure existing object has necessary structure if reused
          });
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapConfirm = (locationData: any) => {
    setMapAddressData(locationData);

    // Auto-fill form fields from map data
    setFormData(prev => ({
      ...prev,
      customerAddress: locationData.formattedAddress,
      customerCity: locationData.components.city || "",
      customerState: locationData.components.state || "",
      customerZip: locationData.components.postalCode || "",
      customerCountry: locationData.components.country || "India",
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    showLoader(isEditMode ? "Updating..." : "Creating...");

    const url = isEditMode
      ? `${CustomerManagementUrl.updateCustomer}/${id}`
      : CustomerManagementUrl.createCustomer;

    const method = isEditMode ? "PUT" : "POST";

    // Prepare Payload
    const payload = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      customerContactPerson: formData.customerContactPerson,
      customerContactPersonNumber: formData.customerContactPersonNumber,
      customerStatus: formData.customerStatus,
      customerType: formData.customerType,

      // Pass the full Map Object if available (especially for creation)
      address: mapAddressData,
    };

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Customer Saved:", data);
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
    <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900">
      <MapPickerModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onConfirm={handleMapConfirm}
        apiKey={GOOGLE_MAPS_API_KEY}
      />

      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 border-b border-gray-200 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-widest text-black">
                {isViewMode ? "Customer Details" : isEditMode ? "Edit Customer" : "New Customer"}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1">
                {isViewMode ? "View Only Mode" : "Enter customer information below"}
              </p>
            </div>
          </div>

          {!isViewMode && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
              {/* Status Toggle */}
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                <span className="text-[10px] uppercase text-gray-400 font-mono mb-1 tracking-wider">Account Status</span>
                <div className="flex items-center border border-gray-900 bg-white w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customerStatus: "active" }))}
                    className={`flex-1 sm:flex-none px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.customerStatus === "active"
                      ? "bg-[#10b981] text-white"
                      : "bg-white text-gray-400 hover:text-black hover:bg-gray-50"
                      }`}
                  >
                    Active
                  </button>
                  <div className="w-[1px] h-full bg-gray-900"></div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customerStatus: "inactive" }))}
                    className={`flex-1 sm:flex-none px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.customerStatus === "inactive"
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-400 hover:text-black hover:bg-gray-50"
                      }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#10b981] transition-colors h-[42px] self-end sm:self-auto"
              >
                {isEditMode ? "Save Changes" : "Create Customer"}
              </button>
            </div>
          )}
        </div>

        {/* API Key Missing Alert - Debug Helper */}
        {!GOOGLE_MAPS_API_KEY && (
          <div className="bg-red-600 text-white p-4 mb-6 rounded-lg shadow-lg animate-pulse">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> API KEY MISSING
            </h3>
            <p className="font-mono text-sm">
              The environment variable <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> is not found.
            </p>
            <div className="mt-2 text-xs font-mono bg-black/20 p-2 rounded">
              <div>1. Check <strong>.env</strong> file for <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...</code></div>
              <div>2. <strong>RESTART</strong> the server (npm run dev)</div>
            </div>
          </div>
        )}

        {/* Form sections */}
        <form onSubmit={handleSubmit} className="space-y-12">

          {/* General Info */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
              01. General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <InputField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="ENTER FULL NAME" disabled={isViewMode} />
              <InputField label="Email Address" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} placeholder="ENTER EMAIL" disabled={isViewMode} />

              <InputField label="Contact Person" name="customerContactPerson" value={formData.customerContactPerson} onChange={handleChange} placeholder="ENTER CONTACT PERSON" disabled={isViewMode} />
              <InputField label="Contact Person Number" name="customerContactPersonNumber" value={formData.customerContactPersonNumber} onChange={handleChange} placeholder="ENTER CONTACT NUMBER" disabled={isViewMode} />

              <InputField label="Business Phone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="ENTER BUSINESS PHONE" disabled={isViewMode} />
            </div>
          </div>

          {/* Address */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6 border-l-4 border-[#10b981] pl-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981]">
                02. Address Details
              </h2>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg mb-8 overflow-hidden">
              {!formData.customerAddress ? (
                <div className="text-center py-8 p-6">
                  <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-mono mb-4">No location selected</p>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="bg-black text-white px-6 py-2 text-xs uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors"
                    >
                      Select Location
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {/* Static Map Snapshot */}
                  {mapAddressData?.location?.coordinates && (
                    <div className="w-full h-48 border-b border-gray-200 relative bg-gray-200">
                      <MapSnapshot
                        apiKey={GOOGLE_MAPS_API_KEY}
                        lat={mapAddressData.location.coordinates[1]}
                        lng={mapAddressData.location.coordinates[0]}
                      />
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={() => setShowMap(true)}
                          className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 text-[10px] shadow-lg rounded uppercase font-bold tracking-widest hover:bg-gray-50 z-10"
                        >
                          Change Location
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-mono">Selected Address</label>
                      <p className="text-sm font-bold text-gray-900 leading-relaxed font-mono">{formData.customerAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-mono">City</label>
                        <p className="text-xs font-bold text-gray-900">{formData.customerCity || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-mono">State</label>
                        <p className="text-xs font-bold text-gray-900">{formData.customerState || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-mono">Zip Code</label>
                        <p className="text-xs font-bold text-gray-900">{formData.customerZip || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-mono">Country</label>
                        <p className="text-xs font-bold text-gray-900">{formData.customerCountry || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
              03. Account Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <SelectField
                label="Customer Type"
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                options={types.map(t => ({ value: t.id, label: t.name }))}
              />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, placeholder, disabled = false, type = "text" }: any) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-mono ${disabled ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, loading, disabled = false, valueKey = "value", labelKey = "label" }: any) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors font-mono uppercase ${disabled ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
    >
      <option value="">{loading ? "Loading..." : "-- SELECT --"}</option>
      {options.map((opt: any, idx: number) => (
        <option key={idx} value={opt[valueKey]}>{opt[labelKey]}</option>
      ))}
    </select>
  </div>
);
