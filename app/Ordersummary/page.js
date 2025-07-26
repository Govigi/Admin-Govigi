'use client';
import PathShower from "@/components/pathShower";
import { useRouter } from 'next/navigation'; 
import ShowStockReport from '@/components/OrderSummary/StockReport';
import ShowProdPricing from '@/components/OrderSummary/ProductPricing';
import ShowDeliveryUpdate from '@/components/OrderSummary/DeliveryUpdate';
import { OrderSummaryUrl } from "../API/endpoints";
import {useState, useEffect} from "react";
export default function OrderSummary() {
    const [orders, setOrders] = useState([]);
    const [prodloading, prodsetLoading] = useState(true);
    const [orderloading, setOrderLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const router = useRouter();
    useEffect(() => {
    const getData = async () => {
        try {
        const res = await fetch(OrderSummaryUrl.getOrderDetails, {
            method: 'GET', 
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Error! status: ${res.status}`);
        }

        const json = await res.json();
        console.log("Fetched data:", json);
        setOrders(json);
        setOrderLoading(false);
        } catch (err) {
        console.error("Failed to fetch data:", err);
        }
    };
    const getProducts = async () => {
        try {
        const res = await fetch(OrderSummaryUrl.getAllProducts, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Error! status: ${res.status}`);
        }

        const json = await res.json();
        console.log("Fetched data:", json);
        setProducts(json);
        prodsetLoading(false);
        } catch (err) {
        console.error("Failed to fetch data:", err);
        }
    };

    getData();
    getProducts();
    }, []);

    const PathList=[["OrderSummary" ,'Order Summary']]
    return(
        <div>
            <PathShower pathList={PathList}/>
            <div className="flex flex-column">
                <div>
                    <ShowStockReport stockData={products} loading={prodloading}/>
                    {console.log(prodloading)}
                    <ShowProdPricing productDetails={products} loading={prodloading}/>
                </div>
                <ShowDeliveryUpdate deliveryDetails={orders} loading={orderloading}/>
            </div>
        </div>
    )
}
