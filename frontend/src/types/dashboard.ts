export interface DashboardItem {
  id: string;
  label: string;
  image: string;
  route: string;
}

export interface DashboardSection {
  id: string;
  title: string;
  items: DashboardItem[];
}

export type BottomNavTab = "home" | "profile" | "requests" | "exit";

export interface BottomNavItem {
  id: BottomNavTab;
  label: string;
  image: string;
  route?: string;
}
