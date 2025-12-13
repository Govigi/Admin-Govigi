"use client";

import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CustomerManagementUrl,
  CustomerTypesUrl,
  StatesAndCitiesUrl,
} from "@/src/libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";

export default function AddCustomer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isEditMode = !!id;
  const isViewMode = mode === "view";

  const { showLoader, hideLoader } = useLoading();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerCity: "",
    customerState: "",
    customerStateIso2: "",
    customerCountry: "India",
    customerZip: "",
    customerType: "",
    customerTypeObject: null,
    customerContactPerson: "",
    customerStatus: "active", // Changed from status to customerStatus to match backend if needed, or keeping both synced
    joinedOn: "",
  });

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    fetchTypes();
    fetchStates();
    if (isEditMode) {
      fetchCustomerDetails(id);
    }
  }, [id, isEditMode]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      showLoader("Loading details...");
      const response = await fetch(`${CustomerManagementUrl.getCustomerById}/${customerId}`);
      const data = await response.json();

      console.log("Customer Data:", data);

      if (data) {
        const addressObj = typeof data.customerAddress === 'object' ? data.customerAddress : null;

        setFormData({
          customerName: data.customerName || "",
          customerEmail: data.customerEmail || "",
          customerPhone: data.customerPhone || "",
          customerAddress: addressObj?.formattedAddress || "",
          customerCity: addressObj?.components?.city || "",
          customerState: addressObj?.components?.state || "",
          customerStateIso2: "", // Will try to match from state name below
          customerCountry: addressObj?.components?.country || "India",
          customerZip: addressObj?.components?.postalCode || "",
          customerType: data.customerType?._id || data.customerType || "",
          customerTypeObject: data.customerType,
          customerContactPerson: data.customerContactPerson || "",
          customerStatus: data.customerStatus || "active",
          joinedOn: data.joinedOn || "",
        });

        // Trigger city fetch if state is present
        // We might need to find the ISO2 for the state name to fetch cities correctly
        if (addressObj?.components?.state) {
          // Logic to find ISO2 will be handled in useEffect when states are loaded or we can try to find it here if states are already loaded (but they might not be)
          // For now, let's store the state name. The state dropdown might need ISO2 to show selected value correctly if it's value-bound to ISO2.
          // We will handle this matching in the useEffect below.
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

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const response = await fetch(StatesAndCitiesUrl.getAllStates);
      const data = await response.json();
      setStates(data?.states || data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  // Match State Name to ISO2 when states are loaded or customerState changes
  useEffect(() => {
    if (states.length > 0 && formData.customerState && !formData.customerStateIso2) {
      const matchedState = states.find((s: any) => s.name.toLowerCase() === formData.customerState.toLowerCase());
      if (matchedState) {
        setFormData(prev => ({ ...prev, customerStateIso2: matchedState.iso2 || matchedState.code }));
        fetchCities(matchedState.iso2 || matchedState.code);
      }
    }
  }, [states, formData.customerState, formData.customerStateIso2]);

  const fetchCities = async (stateIso2: any) => {
    try {
      setLoadingCities(true);
      const apiUrl = StatesAndCitiesUrl.getCitiesByState.replace("{state}", stateIso2);
      const response = await fetch(apiUrl);
      const data = await response.json();
      setCities(data?.cities || data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (e: any) => {
    const { value } = e.target;
    // Find state object to get name and iso2
    // If value is iso2, fine. If it's name, find iso2.
    // The select options values are a bit ambiguous in original code, assume value matches what's stored or unique ID.
    // Let's rely on finding by iso2 or name.

    // Simplification: We will store the value as iso2 in stateIso2
    const stateObj = states.find((s: any) => s.iso2 === value || s.name === value);

    setFormData((prev) => ({
      ...prev,
      customerState: stateObj?.name || value,
      customerStateIso2: stateObj?.iso2 || value,
      customerCity: "",
    }));

    if (stateObj?.iso2) {
      fetchCities(stateObj.iso2);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    showLoader(isEditMode ? "Updating..." : "Creating...");

    const url = isEditMode
      ? `${CustomerManagementUrl.updateCustomer}/${id}`
      : CustomerManagementUrl.createCustomer;

    const method = isEditMode ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Customer Saved:", data);
        router.push("/customers-dashboard");
      })
      .catch((error) => {
        console.error("Error saving customer:", error);
      })
      .finally(() => {
        hideLoader();
      });
  };

  const InputField = ({ label, name, value, onChange, placeholder, disabled = false, type = "text" }: any) => (
    <div className="mb-4">
      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || isViewMode}
        placeholder={isViewMode ? "" : placeholder}
        className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-mono ${disabled || isViewMode ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
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
        disabled={disabled || isViewMode}
        className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors font-mono uppercase ${disabled || isViewMode ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
      >
        <option value="">{loading ? "Loading..." : "-- SELECT --"}</option>
        {options.map((opt: any, idx: number) => (
          <option key={idx} value={opt[valueKey]}>{opt[labelKey]}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-mono text-gray-900">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-black">
                {isViewMode ? "Customer Details" : isEditMode ? "Edit Customer" : "New Customer"}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {isViewMode ? "View Only Mode" : "Enter customer information below"}
              </p>
            </div>
          </div>

          {!isViewMode && (
            <div className="flex items-center gap-6">
              {/* Status Toggle */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-gray-400 font-mono mb-1 tracking-wider">Account Status</span>
                <div className="flex items-center border border-gray-900 bg-white">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customerStatus: "active" }))}
                    className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.customerStatus === "active"
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
                    className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.customerStatus === "inactive"
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
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#10b981] transition-colors h-[42px] self-end"
              >
                {isEditMode ? "Save Changes" : "Create Customer"}
              </button>
            </div>
          )}
        </div>

        {/* Form sections */}
        <form onSubmit={handleSubmit} className="space-y-12">

          {/* General Info */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
              01. General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <InputField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="ENTER FULL NAME" />
              <InputField label="Contact Person" name="customerContactPerson" value={formData.customerContactPerson} onChange={handleChange} placeholder="ENTER CONTACT PERSON" />
              <InputField label="Email Address" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} placeholder="ENTER EMAIL" />
              <InputField label="Phone Number" name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="ENTER PHONE" />
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
              02. Address Details
            </h2>
            <div className="grid grid-cols-1 gap-y-2 mb-6">
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">Full Address</label>
                <textarea
                  name="customerAddress"
                  rows={3}
                  value={formData.customerAddress}
                  onChange={handleChange}
                  disabled={isViewMode}
                  placeholder={isViewMode ? "" : "ENTER FULL ADDRESS"}
                  className={`block w-full border border-gray-300 bg-transparent p-3 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors font-mono resize-none ${isViewMode ? "text-gray-500 bg-gray-50" : "text-black"}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <SelectField
                label="State"
                name="customerStateIso2"
                value={formData.customerStateIso2}
                onChange={handleStateChange}
                options={states.map(s => ({ value: s.iso2 || s.code, label: s.name }))}
                loading={loadingStates}
              />
              <SelectField
                label="City"
                name="customerCity"
                value={formData.customerCity}
                onChange={handleChange}
                options={cities.map(c => ({ value: c.name, label: c.name }))}
                loading={loadingCities}
                disabled={!formData.customerStateIso2}
              />
              <InputField label="Pin Code" name="customerZip" value={formData.customerZip} onChange={handleChange} placeholder="ENTER PIN CODE" />
              <InputField label="Country" name="customerCountry" value={formData.customerCountry} onChange={handleChange} disabled={true} />
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
