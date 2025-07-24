import PathShower from "@/components/pathShower";
import PricingDetails from "./pricingdetails";
const PathList=[["Ordersummary" ,'Order Summary'], ["showPricing", "Products & Pricing"]]
export default function StockPricing(){
    return (
        <div>
            <PathShower pathList={PathList}/>
            <PricingDetails/>
        </div>
    );
}   