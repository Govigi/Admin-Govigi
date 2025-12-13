import axios from "axios";
import { VendorUrl } from "./utils/API/endpoints";

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
