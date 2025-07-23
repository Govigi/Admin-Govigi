import PathShower from "@/components/pathShower";
const PathList=[["Ordersummary" ,'Order Summary'], ["showPricing", "Products & Pricing"]]
export default function StockPricing(){
    return (
        <div>
            <PathShower pathList={PathList}/>
        </div>
    );
}   