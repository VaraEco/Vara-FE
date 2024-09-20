import Admin from "../../Components/Admin/Admin";
import DashboardWrapper from "../../Components/Common/DashboardWrapper";
import LoginWrapper from "../../Components/Common/LoginWrapper";
import { ProviderConfig } from "../../Components/Common/ProviderConfig";
import {
  GetStartedSvg,
  InsightsSvg,
  SettingsSvg,
  referFriends,
  IconDatabase,
  IconPaper_folded,
  IconTruck,
  IconListTask,
} from "../../Components/Common/SideBarSvg";
import Dashboard from "../../Components/Dashboard/Dashboard";
import Login from "../../Components/Login/Login";
import Onboarding from "../../Components/Onboarding/Onboarding";
import ReferralPage from "../../Components/Referral/ReferralPage";
import Settings from "../../Components/Settings/Settings";
import Parameteroverview from "../../Components/DataCollection/parameteroverview";
import DataCollection from "../../Components/DataCollection/datacollection";
import Certification from "../../Components/Compliance/complianceFramework";
import ProjectManagement from "../../Components/Compliance/projectManagement";
import ProjectPage from "../../Components/Compliance/projectPage";
// add SupplierManagement Component
import SupplierManagement from "../../Components/DataCollection/supplierManagement";
// add SupplierAnalytics Component
import SupplierAnalytics from "../../Components/DataCollection/supplierAnalytics";
import Parameter from "../../Components/DataCollection/parameter";
import DataEntry from "../../Components/DataCollection/dataentry";
import DataEntryDetails from "../../Components/DataCollection/dataentrydetails";
import Chatbot from "../../Components/Compliance/chatbot";
import DataPoint from "../../Components/DataCollection/datapoint";
import DataAnalytics from "../../Components/DataCollection/dataanalytics";
import PrivateRoute from "../../Components/Common/PrivateRoute";

export const routesConfig = [
  {
    path: "/login",
    name: "Login",
    logo: "",
    component: (
      <ProviderConfig showTag={true}>
        <LoginWrapper>
          <Login />
        </LoginWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: false,
  },
  {
    path: "*",
    name: "Login",
    logo: "",
    component: (
      <ProviderConfig showTag={true}>
        <LoginWrapper>
          <Login />
        </LoginWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: false,
  },
  {
    path: "/onboarding",
    name: "Onboarding",
    logo: "",
    component: (
      <ProviderConfig showTag={false}>
        <LoginWrapper>
          <Onboarding />
        </LoginWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: false,
  },
  {
    path: "/dashboard",
    name: "Get Started",
    logo: GetStartedSvg(),
    //  importConfig.routesIcons.dashboardIcon,
    component: (
      <ProviderConfig showTag={false}>
        <Dashboard></Dashboard>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/data_entry",
    name: "Data Entry",
    logo: IconDatabase(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"Data Entry"}>
          <PrivateRoute>
          <DataEntry></DataEntry>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: false,
    isUpper: true,
  },

  {
    path: "/data_entry_details",
    name: "Data Entry Details",
    logo: IconDatabase(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"Data Entry Details"}>
          <PrivateRoute>
          <DataEntryDetails></DataEntryDetails>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/data_collection",
    name: "Data Collection",
    logo: IconDatabase(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"metrics"}>
          <PrivateRoute>
          <Parameteroverview></Parameteroverview>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: false,
    isUpper: true,
  },
  
  {
    path: "/data_collection/:parameter/:process",
    name: "parameter",
    logo: InsightsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"parameter"}>
          <PrivateRoute>
          <Parameter></Parameter>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/data_collection/:parameter/:process/:data_point",
    name: "data_source",
    logo: InsightsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"parameter"}>
          <PrivateRoute>
          <DataPoint></DataPoint>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/data_collection/admin",
    name: "Datasource",
    logo: InsightsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"datasources"}>
          <PrivateRoute>
          <Admin></Admin>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/datacollection/:metric/:name/:assigned_to",
    name: "DataPoint",
    logo: InsightsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"datasources"}>
          <PrivateRoute>
          <DataCollection></DataCollection>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/datacollection/:admin/:admin/:admin",
    name: "DataPoint",
    logo: InsightsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"datasources"}>
          <PrivateRoute>
          <Admin></Admin>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/suppliermanagement",
    name: "Supplier Management",
    logo: IconTruck(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"suppliermanagement"}>
          <PrivateRoute>
          <SupplierManagement></SupplierManagement>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: false,
    isUpper: true,
  },
  /* have to make routes for each supplier */
  {
    path: "/suppliermanagement/:supplier_name",
    name: "Supplier Analytics",
    logo: InsightsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"suppliermanagement"}>
          <PrivateRoute>
          <SupplierAnalytics></SupplierAnalytics>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/project_management",
    name: "Compliance Management",
    logo: IconListTask(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"suppliermanagement"}>
          <PrivateRoute>
          <ProjectManagement></ProjectManagement>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: false,
    isUpper: true,
  },
  {
    path: "/project_management/project_page/:id",
    name: "Project Page",
    logo: IconListTask(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"suppliermanagement"}>
          <PrivateRoute>
          <ProjectPage></ProjectPage>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/compliance",
    name: "Compliance Frameworks",
    logo: IconPaper_folded(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"certification"}>
          <PrivateRoute>
          <Certification></Certification>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: false,
    isUpper: true,
  },
  {
    path: "/dataanalytics",
    name: "Data Analytics",
    logo: IconPaper_folded(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"dataanalytics"}>
          <PrivateRoute>
            <DataAnalytics></DataAnalytics>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: false,
    isUpper: true,
  },
  {
    path: "/settings",
    name: "Settings",
    logo: SettingsSvg(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"Settings"}>
          <PrivateRoute>
          <Settings></Settings>
          </PrivateRoute>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/referral",
    name: "Refer Friends",
    logo: referFriends(),
    component: (
      <ProviderConfig showTag={false}>
        <DashboardWrapper selectdRoute={"referal"}>
          <ReferralPage></ReferralPage>
        </DashboardWrapper>
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: true,
  },
  {
    path: "/chatbot",
    name: "Chatbot",
    logo: "",
    component: (
      <ProviderConfig showTag={false}>
        <Chatbot />
      </ProviderConfig>
    ),
    hidden: true,
    isUpper: false,
  },
];
