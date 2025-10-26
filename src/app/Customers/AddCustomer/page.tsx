"use client";

import React from "react";

import { ArrowLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CustomerManagementUrl,
  CustomerTypesUrl,
  StatesAndCitiesUrl,
} from "@/src/libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";

export default function AddCustomer() {
  const router = useRouter();

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
    customerContactPerson: "",
    status: "active",
    joinedOn: "",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [types, setTypes] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const handleStateChange = (e: any) => {
    const { value } = e.target;
    const stateObj: any =
      states.find((s: any) => (s.iso2 || s.code || s.id) == value) ||
      states.find((s: any) => s.name == value) ||
      null;

    setFormData((prev) => ({
      ...prev,
      customerState: stateObj?.name ?? value,
      customerStateIso2: stateObj?.iso2 ?? value,
      customerCity: "",
    }));
  };

  useEffect(() => {
    showLoader("Loading customer types...");
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await fetch(CustomerTypesUrl.getAllTypes);
      const data = await response.json();

      const typesArray = data?.types || data;

      const simplifiedTypes = typesArray.map((type) => ({
        id: type._id,
        name: type.typeName,
      }));

      setTypes(simplifiedTypes);
    } catch (error) {
      console.error("Error fetching customer types:", error);
    }
  };

  // Fetch states on mount
  useEffect(() => {
    document.title = "Add New Customer";
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const response = await fetch(StatesAndCitiesUrl.getAllStates);
      const data = await response.json();
      setStates(data?.states || data); // adjust depending on API structure
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.customerStateIso2) return;
    fetchCities(formData.customerStateIso2);
  }, [formData.customerStateIso2]);

  const fetchCities = async (stateIso2: any) => {
    try {
      setLoadingCities(true);
      const apiUrl = StatesAndCitiesUrl.getCitiesByState.replace(
        "{state}",
        stateIso2
      );
      const response = await fetch(apiUrl);
      const data = await response.json();
      setCities(data?.cities || data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const backend_url = CustomerManagementUrl.createCustomer;

    fetch(backend_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Customer created:", data);
      })
      .catch((error) => {
        console.error("Error creating customer:", error);
      });
  };

  return (
    <div className="p-8 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Customer
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
        >
          <UserPlusIcon className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2 space-y-8">
          {/* General Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
              General Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Enter full name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="customerContactPerson"
                  placeholder="Enter contact person"
                  value={formData.customerContactPerson}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="Enter email address"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Address
                </label>
                <textarea
                  name="customerAddress"
                  rows={2}
                  placeholder="Enter address"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                />
              </div>

              {/* State Dropdown */}
              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  State
                </label>
                <select
                  name="customerStateIso2"
                  value={formData.customerStateIso2 || ""}
                  onChange={handleStateChange}
                  disabled={loadingStates}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">
                    {loadingStates ? "Loading States..." : "-- Select State --"}
                  </option>
                  {states.map((state) => (
                    <option
                      key={state.id || state.name}
                      value={state.iso2 ?? state.code ?? state.name}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  City
                </label>
                <select
                  name="customerCity"
                  value={formData.customerCity}
                  onChange={handleChange}
                  disabled={!formData.customerStateIso2 || loadingCities}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">
                    {loadingCities ? "Loading Cities..." : "-- Select City --"}
                  </option>
                  {cities.map((city) => (
                    <option key={city.id || city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="customerZip"
                  placeholder="Enter pin code"
                  value={formData.customerZip}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Contact & Type */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
              Contact & Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Phone
                </label>
                <input
                  type="text"
                  name="customerPhone"
                  placeholder="+91 50123 45678"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Type
                </label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">-- Select Type --</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium mb-1 block">
                  Joined On
                </label>
                <input
                  type="date"
                  name="joinedOn"
                  value={formData.joinedOn}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
