import { Layout, Menu, Typography } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { Content, Header } from 'antd/es/layout/layout';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import OragnizationElectionListPage from './electionsList.page';
import OrganizationElectionCreatePage from './electionCreate.page';
import {
  BoxPlotOutlined,
  HomeOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import OrganizationUsersListPage from './usersList.page';
import OrganizationElectionViewHandler from './electionView/_handler';
import UserDropDown from '../../components/userDropdown';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import UserGroupsPage from './userGroups.page';
import DashboardPage from './index';
import UserProfile from './user-profile';
import packageJson from '../../../package.json';

const version = packageJson.version;

const OrganizationHandler = () => {
  const navigate = useNavigate();

  const { orgId } = useParams();
  const { session } = useSelector((store) => store.auth);
  const organizationDetail = _.find(session?.organizations, { _id: orgId });

  const onMenuSelect = ({ key }) => {
    navigate(`/dashboard/org/${orgId}/${key}`);
  };

  return (
    <Layout theme="light" className="organization-dashboard h-screen">
      <Header theme="light" className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <Typography.Text className="logo">E-Voting</Typography.Text>
          <small style={{ color: 'grey' }}>/</small>
          <Typography.Paragraph className="org-name">
            {organizationDetail?.name || '--'}
          </Typography.Paragraph>
        </div>
        <UserDropDown />
      </Header>
      <Layout theme="light">
        <Sider theme="light" width={240}>
          <Menu
            theme="light"
            mode="inline"
            onSelect={onMenuSelect}
            defaultSelectedKeys=""
            className="h-full"
            items={[
              { icon: <HomeOutlined />, key: '', label: 'Dashboard' },
              {
                icon: <BoxPlotOutlined />,
                key: 'elections',
                label: 'Elections',
              },

              { type: 'group', label: 'User Management' },
              { icon: <UserOutlined />, key: 'users', label: 'Users' },
              {
                icon: <UsergroupAddOutlined />,
                key: 'groups',
                label: 'Groups',
              },
            ]}
          />
          <Typography.Text className="text-xs p-2 text-slate-700 font-bold">
            v{version}
          </Typography.Text>
        </Sider>
        <Content>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/elections"
              element={<OragnizationElectionListPage />}
            />
            <Route
              path="/elections/create"
              element={<OrganizationElectionCreatePage />}
            />

            <Route
              path="/elections/:electionId/*"
              element={<OrganizationElectionViewHandler />}
            />
            <Route path="/users" element={<OrganizationUsersListPage />} />
            <Route path="/groups" element={<UserGroupsPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};
export default OrganizationHandler;
