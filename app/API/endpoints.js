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