import PathShower from "@/components/pathShower";
import DeliveryReport from "./deliverydetails";
const PathList=[["Ordersummary" ,'Order Summary'], ["showDeliverysts", "Delivery Status and Updates"]]
export default function DeliveryUpdates(){
    return (
        <div>
            <PathShower pathList={PathList}/>
            <DeliveryReport/>
        </div>
    );
}   