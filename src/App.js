import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
// import UserElectionViewPage from "./pages/home/electionView.page";
// import DashboardElectionListPage from "./pages/dashboard/electionsList.page";
import { QueryClient, QueryClientProvider } from 'react-query';
// import OrganizationElectionCreatePage from "./pages/dashboard/electionCreate.page";
// import OrganizationHandler from "./pages/dashboard/_handler";
import LoginPage from './pages/auth/login.page';
import { ConfigProvider } from 'antd';
import theme from './theme';
// import UserElectionListPage from "./pages/home/electionList.page";
import HomeHandler from './pages/home/_handler';
import { Provider } from 'react-redux';
import store from './store';
import OrganizationHandler from './pages/dashboard/_handler';
import RootHanlder from './pages/root';
// import AuthSwitchPage from "./pages/auth/switch.page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: false,
      cacheTime: 1000 * 60 * 5,
    },
  },
});
const App = () => {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/*" element={<RootHanlder />}>
                <Route path="*" element={<HomeHandler />} />
                <Route path="auth/login" element={<LoginPage />} />
                <Route
                  path="dashboard/org/:orgId/*"
                  element={<OrganizationHandler />}
                />
              </Route>
            </Routes>
          </Router>
        </QueryClientProvider>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
