import { Suspense } from "react";
import AddSubcategoryClient from "./AddSubcategoryClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddSubcategoryClient />
    </Suspense>
  );
}
