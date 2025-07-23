import PathShower from "@/components/pathShower";
const PathList=[["Ordersummary" ,'Order Summary'], ["stockReport", "Stock Report"]]
export default function StockPage(){
    return (
        <div>
            <PathShower pathList={PathList}/>
        </div>
    );
}   