import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomeElectionsListPage from './electionList.page';
import HomeElectionViewPage from './electionView.page';

const HomeHandler = () => {
  return (
    <Layout className="home-layout">
      <Content className="site-layout" style={{ padding: '0 15em' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/elections" />} />
          <Route path="/elections" element={<HomeElectionsListPage />} />
          <Route
            path="/elections/:electionId"
            element={<HomeElectionViewPage />}
          />
        </Routes>
      </Content>
    </Layout>
  );
};

export default HomeHandler;
