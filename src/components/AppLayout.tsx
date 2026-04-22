import { Outlet } from "react-router-dom";
import Header from "./Header";
import OfflineIndicator from "./OfflineIndicator";

export default function AppLayout() {
  return (
    <>
      <Header variant="app" />
      <OfflineIndicator />
      <Outlet />
    </>
  );
}
