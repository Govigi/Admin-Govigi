import { config } from "../config";

const backend_url = config.backend_url;

export const OrderSummaryUrl = {
  login: backend_url + "/admin/login",
  getOrderDetails: backend_url + "/getAllOrders",
  getOrdersByDateRange: backend_url + "/getOrdersByDateRange",
  getAllProducts: backend_url + "/getAllProducts",
  createProduct: backend_url + "/createProduct",
  updateProduct: backend_url + "/updateProduct",
  bulkUpdateProducts: backend_url + "/bulkUpdateProducts",
  deleteProduct: backend_url + "/deleteProduct",
  updateorderStatus: (id) => `${backend_url}/updateStatus/${id}`,
  updatePaymentStatus: (id) => `${backend_url}/updatePaymentStatus/${id}`,
  getUserOrders: backend_url + "/userOrders",
  createOrder: backend_url + "/createOrder",
  getOrderById: backend_url + "/getOrder",
};

export const ProductManagementUrl = {
  getProductsStats: backend_url + "/getProductsStats",
};

export const ProductRequestUrl = {
  createProductRequest: backend_url + "/createProductRequest",
  getAllProductRequests: backend_url + "/getAllProductRequests",
};

export const CategoryManagementUrl = {
  createCategory: backend_url + "/createCategory",
  updateCategory: backend_url + "/updateCategory", // /:id
  deleteCategory: backend_url + "/deleteCategory", // /:id
  getAllCategoriesStats: backend_url + "/getAllCategoriesStats",
  getAllCategories: backend_url + "/getAllCategories",
};

export const CustomerDashboardUrl = {
  getAllCustomers: backend_url + "/getAllCustomers",
  getCustomerDetails: backend_url + "/getCustomerDetails",
  getCustomerOrders: backend_url + "/getCustomerOrders",
  getAllCustomersStats: backend_url + "/getAllCustomersStats",
};

export const CustomerManagementUrl = {
  createCustomer: backend_url + "/createCustomer",
  updateCustomer: backend_url + "/updateCustomer", // /:id
  getCustomerById: backend_url + "/getCustomer", // /:id
};

export const CustomerTypesUrl = {
  getAllTypes: backend_url + "/getAllCustomerTypes",
};

export const StatesAndCitiesUrl = {
  getAllStates: backend_url + "/getStates/IN",
  getCitiesByState: backend_url + "/getCities/IN/{state}",
};

export const AdminUrl = {
  // Scheduling
  getSchedulingSettings: "http://localhost:8000/settings/scheduling",
  updateSchedulingSettings: "http://localhost:8000/settings/scheduling",
  // Customers
  getPendingCustomers: backend_url + "/admin/customers/pending",
  updateCustomerStatus: backend_url + "/admin/customers/{id}/status",
  // Segments
  createCustomerType: backend_url + "/admin/customer-types",
  updateCustomerType: backend_url + "/admin/customer-types/{id}",
  deleteCustomerType: backend_url + "/admin/customer-types/{id}",
  getAllCustomerTypes: backend_url + "/getAllCustomerTypes", // Existing public one or admin specific if needed
  // Drivers
  createDriver: backend_url + "/admin/drivers",
  getAllDrivers: backend_url + "/admin/drivers",
  assignDriver: backend_url + "/admin/orders/{orderId}/assign-driver",
  updateOrderStatus: backend_url + "/admin/orders/{orderId}/status",
  updatePaymentStatus: backend_url + "/admin/orders/{orderId}/payment-status",
  // Finance
  getTransactions: backend_url + "/admin/finance/transactions",
  // Settings
  getSettings: backend_url + "/admin/settings/{key}",
  updateSettings: backend_url + "/admin/settings",
};

export const GoogleMapsUrl = {
  autocomplete: backend_url + "/maps/autocomplete",
  placeDetails: backend_url + "/maps/place-details",
  geocode: backend_url + "/maps/geocode",
  reverseGeocode: backend_url + "/maps/reverse-geocode",
};


export const VendorUrl = {
  createVendor: backend_url + "/vendors/create",
  getAllVendors: backend_url + "/vendors/getAll",
  getVendorById: backend_url + "/vendors/get", // /:id
  updateVendor: backend_url + "/vendors/update", // /:id
  deleteVendor: backend_url + "/vendors/delete", // /:id
};

export const SourcingUrl = {
  getNearbyVendors: backend_url + "/sourcing/vendors",
  assignOrders: backend_url + "/sourcing/assign",
};
