import {
  LogoutOutlined,
  SwitcherOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  List,
  Menu,
  Modal,
  Typography,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { authSetSession } from '../store/reducers/auth';
import { UserAvatarImage } from './user-data';

const UserDropDown = () => {
  const navigate = useNavigate();
  const { session } = useSelector((store) => store.auth);

  const dispatch = useDispatch();

  const location = useLocation();
  const { orgId } = useParams();

  const onLogout = () => {
    window.localStorage.removeItem('e-voting.auth.token');
    dispatch(authSetSession(null));
    window.location.href = '/';
  };

  const onNavigate = () => {
    navigate(`/dashboard/org/${orgId}/profile`);
  };

  const zeroOrganization = session?.organizations?.length === 0;
  const isAdmin = session?.hasNoAdminAccessOrganizations.length ? true : false;
  const onOrgSelect = (orgId) => {
    navigate(`/dashboard/org/${orgId}`);
  };

  return (
    <>
      <Dropdown
        arrow
        trigger={['click']}
        placement="bottomRight"
        overlay={
          <Menu>
            <Menu.Item
              key="switch"
              onClick={() => navigate({ hash: 'auth-switch' })}
              icon={<SwitcherOutlined />}
            >
              Switch
            </Menu.Item>
            {orgId && (
              <Menu.Item
                key="profile"
                onClick={onNavigate}
                icon={<UserOutlined />}
              >
                Profile
              </Menu.Item>
            )}
            <Menu.Item
              onClick={onLogout}
              key="logout"
              icon={<LogoutOutlined />}
              danger
            >
              Logout
            </Menu.Item>
          </Menu>
        }
      >
        <div>
          <UserAvatarImage />
          <span style={{ marginLeft: 8 }}>
            {session?.profile?.fullName || '---'}
          </span>
        </div>
      </Dropdown>

      <Modal
        title="Switch to Account"
        open={location.hash === '#auth-switch'}
        centered={true}
        onCancel={() => navigate({ hash: '' })}
        footer={null}
      >
        {zeroOrganization && (
          <div className="py-4 text-center">
            <Typography.Text className="text-red-500">
              You're not a part of any organization.
            </Typography.Text>
          </div>
        )}
        {!zeroOrganization && (
          <>
            <Divider
              type="horizontal"
              orientation="left"
              plain
              style={{ marginBlock: '0px' }}
            >
              Organization Account
            </Divider>
            <List
              itemLayout="horizontal"
              dataSource={session?.organizations}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button onClick={() => onOrgSelect(item._id)}>
                      Select
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{item.name[0]}</Avatar>}
                    title={item.name}
                  />
                </List.Item>
              )}
            />
          </>
        )}
        <Divider
          type="horizontal"
          orientation="left"
          plain
          style={{ marginBlock: '0px' }}
        >
          Voting Account
        </Divider>
        <List itemLayout="horizontal">
          <List.Item
            actions={[<Button onClick={() => navigate('/')}>Select</Button>]}
          >
            <List.Item.Meta
              avatar={<Avatar>{session?.profile?.fullName[0]}</Avatar>}
              title={session?.profile?.fullName}
            />
          </List.Item>
        </List>

        {isAdmin && (
          <>
            <Divider type="horizontal" orientation="left" plain>
              Organizations you're User
            </Divider>
            <List
              itemLayout="horizontal"
              dataSource={session?.hasNoAdminAccessOrganizations}
              renderItem={(item) => (
                <List.Item actions={['User']}>
                  <List.Item.Meta
                    avatar={<Avatar>{item.name[0]}</Avatar>}
                    title={item.name}
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default UserDropDown;
