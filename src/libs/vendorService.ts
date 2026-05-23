import axios from "axios";
import { VendorUrl, CategoryManagementUrl } from "./utils/API/endpoints";

const getAuthHeader = () => {
    const token = localStorage.getItem("admin_token");
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getVendors = async () => {
    const response = await axios.get(VendorUrl.getAllVendors, getAuthHeader());
    return response.data;
};

export const getVendorById = async (id: string) => {
    const response = await axios.get(`${VendorUrl.getVendorById}/${id}`, getAuthHeader());
    return response.data;
};

export const createVendor = async (data: any) => {
    const response = await axios.post(VendorUrl.createVendor, data, getAuthHeader());
    return response.data;
};

export const updateVendor = async (id: string, data: any) => {
    const response = await axios.patch(`${VendorUrl.updateVendor}/${id}`, data, getAuthHeader());
    return response.data;
};

export const deleteVendor = async (id: string) => {
    const response = await axios.delete(`${VendorUrl.deleteVendor}/${id}`, getAuthHeader());
    return response.data;
};

export const getCategories = async () => {
    const response = await axios.get(CategoryManagementUrl.getAllCategories, getAuthHeader());
    return response.data;
};

export const getVendorsPerformance = async () => {
    const response = await axios.get(VendorUrl.getPerformance, getAuthHeader());
    return response.data;
};

export const recordVendorPayout = async (data: {
    vendorId: string;
    amount: number;
    paymentMethod: string;
    referenceId: string;
    remarks?: string;
    payoutType?: string;
}) => {
    const response = await axios.post(VendorUrl.recordPayout, data, getAuthHeader());
    return response.data;
};

export const processEmergencyPayout = async (id: string, data: {
    status: "Paid" | "Rejected";
    paymentMethod?: string;
    referenceId?: string;
    remarks?: string;
}) => {
    const response = await axios.patch(VendorUrl.processPayout(id), data, getAuthHeader());
    return response.data;
};

export const updateVendorPayoutSettings = async (data: {
    vendorId: string;
    payoutSchedule?: string;
    emergencyPayoutEnabled?: boolean;
}) => {
    const response = await axios.patch(VendorUrl.updatePayoutSettings, data, getAuthHeader());
    return response.data;
};

export const createCategory = async (data: FormData) => {
    const response = await axios.post(CategoryManagementUrl.createCategory, data, {
        headers: {
            ...getAuthHeader().headers,
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
};
