import PathShower from "@/components/pathShower";
export default function DashBoard(){
   const PathList=[["dashboard" ,'Dashboard']]
    return (
         <div>
            <PathShower pathList={PathList}/>
        </div>
    );
}   