import { Suspense } from "react";
import AddCategoryClient from "./AddCategoryClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddCategoryClient />
    </Suspense>
  );
}