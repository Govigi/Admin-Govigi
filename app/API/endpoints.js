const backend_url = process.env.NEXT_PUBLIC_API_URL

export const OrderSummaryUrl = {
    login: backend_url+"/admin/login",
    getOrderDetails: backend_url+"/getAllOrders",
    getAllProducts: backend_url+"/getAllProducts",
    createProduct: backend_url+"/createProduct",
    updateProduct: backend_url+"/updateProduct",
    deleteProduct: backend_url+"/deleteProduct",
    updateorderStatus: backend_url+"/updateStatus",
}

export const ProductManagementUrl = {
    getProductsStats: backend_url+"/getProductsStats",
}

export const CategoryManagementUrl = {
    createCategory: backend_url+"/createCategory",
    getAllCategoriesStats: backend_url+"/getAllCategoriesStats",
}

export const CustomerDashboardUrl = {
    getAllCustomers: backend_url+"/getAllCustomers",
    getCustomerDetails: backend_url+"/getCustomerDetails",
    getCustomerOrders: backend_url+"/getCustomerOrders",
    getAllCustomersStats: backend_url+"/getAllCustomersStats",
}

export const CustomerManagementUrl = {
    createCustomer: backend_url+"/createCustomer",
}

export const CustomerTypesUrl = {
    getAllTypes: backend_url+"/getAllCustomerTypes",
}

export const StatesAndCitiesUrl = {
    getAllStates: backend_url+"/getStates/IN",
    getCitiesByState: backend_url+"/getCities/IN/{state}",
}