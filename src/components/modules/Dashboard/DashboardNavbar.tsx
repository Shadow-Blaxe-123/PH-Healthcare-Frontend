import { getUserInfo } from "@/services/auth/getUserInfo";
import DashboardNavbarContent from "./DashboardNavbarContent";
import { UserInfo } from "@/types/user.interface";

async function DashboardNavbar() {
  const userInfo = await getUserInfo();
  return <DashboardNavbarContent userInfo={userInfo as UserInfo} />;
}
export default DashboardNavbar;
