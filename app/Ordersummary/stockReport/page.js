import PathShower from "@/components/pathShower";
import StockDetails from './stockdetails'
const PathList=[["Ordersummary" ,'Order Summary'], ["stockReport", "Stock Report"]]
export default function StockPage(){
    return (
        <div>
            <PathShower pathList={PathList}/>
            <StockDetails/>
        </div>
    );
}   