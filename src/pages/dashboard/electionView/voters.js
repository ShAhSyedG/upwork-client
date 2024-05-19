import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Drawer, Modal, Space, Table, Typography, message } from 'antd';
import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import request from '../../../utils/request';
import { formatCnic, isoDateFormat } from '../../../utils/helper';
import { UserAvatarImage } from '../../../components/user-data';
import { useElectionContext } from './context';
import { useHandleHashRoutes } from '../../../hooks/use-handle-hash-routes';

const Voters = () => {
  const electionDetail = useElectionContext();
  const [groupData, setGroupData] = React.useState(null);
  const [drawer, setDrawer] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [voters, setVoters] = React.useState([]);
  const [selectedKeys, setSelectedKeys] = React.useState([]);

  const { orgId, electionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useHandleHashRoutes();

  const status = electionDetail.status;

  const groupList = useQuery(`org:${orgId}.usersGroups`, async () => {
    const { data } = await request.get(`/organization/${orgId}/usersGroups`);
    return data;
  });

  const getVotersList = useQuery(
    `org:${orgId}.votersList`,
    async () => {
      const { data } = await request.get(
        `/organization/${orgId}/elections/${electionId}/get-voters-list`,
      );
      return data;
    },
    {
      onSuccess: (response) => {
        setVoters(response);
      },
      onError: (error) => {
        message.error(error.message);
      },
    },
  );

  const usersImport = useMutation(
    'import-users-from-group',
    async (payload) => {
      return await request.post(
        `/organization/${orgId}/elections/${electionId}/import-voter-list`,
        payload,
      );
    },
    {
      onSuccess: (response) => {
        message.success(response.message);
        getVotersList.refetch();
        navigate({ hash: '' });
      },
      onError: (error) => {
        message.error(error.message);
      },
    },
  );

  const addSingleVoter = useMutation(
    `org:${orgId}.add-single-voter`,
    async (payload) => {
      return await request.put(
        `/organization/${orgId}/elections/${electionId}/add-single-voter`,
        { user: payload },
      );
    },
    {
      onSuccess: (response, payload) => {
        message.success(
          `${payload?.fullName || payload?.cnic} successfully added!`,
        );
        getVotersList.refetch();
      },
      onError: (error) => {
        message.error(error.message);
      },
    },
  );

  const removeVoter = useMutation(
    `org:${orgId}.remove-voter`,
    async (payload) => {
      return await request.put(
        `/organization/${orgId}/elections/${electionId}/remove-voter`,
        { users: payload },
      );
    },
    {
      onSuccess: (response, payload) => {
        message.success(`User(s) Successfully removed`);
        setSelectedKeys([]);
        getVotersList.refetch();
      },
      onError: (error) => {
        message.error(error.message);
      },
    },
  );

  const users = voters.map((voter) => voter._id);

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (selectedRowKeys) => {
      setSelectedKeys(selectedRowKeys);
    },
  };

  const onImportAllVoters = (row) => {
    // first resetting the state
    // because when you click on the same group again,
    // the state is not being updated
    setSelectedGroup(null);
    setTimeout(() => setSelectedGroup(row), 0);
  };

  React.useEffect(() => {
    if (selectedGroup) {
      usersImport.mutate({ users: selectedGroup?.users });
    }
  }, [selectedGroup, usersImport.mutate]);

  return (
    <>
      <div
        className="flex items-center justify-end"
        style={{ marginBottom: '1rem' }}
      >
        <Button
          danger
          className="mx-3"
          disabled={voters.length === 0 || status === 'closed'}
          icon={<DeleteOutlined />}
          onClick={() =>
            removeVoter.mutate(selectedKeys.length > 0 ? selectedKeys : users)
          }
        >
          {selectedKeys.length > 0
            ? 'Remove selected voters'
            : 'Remove all voters'}
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate({ hash: 'import-user-groups' })}
        >
          Import from groups
        </Button>
      </div>
      <div>
        <Table
          pagination={{ position: ['none', 'bottomCenter'] }}
          dataSource={getVotersList?.data?.map((data) => ({
            ...data,
            key: data._id,
          }))}
          loading={getVotersList.isLoading}
          columns={[
            {
              title: 'Name',
              render: (row) => row?.fullName || '--',
            },
            {
              title: 'Cnic #',
              render: (row) =>
                (
                  <Typography.Text className="font-mono">
                    {formatCnic(row?.cnic)}
                  </Typography.Text>
                ) || '--',
            },
            {
              title: 'Actions',
              render: (row) => (
                <Space>
                  <Button
                    danger
                    size="small"
                    type="default"
                    icon={<DeleteOutlined />}
                    onClick={() => removeVoter.mutate([row._id])}
                    disabled={status === 'closed'}
                  >
                    Remove
                  </Button>
                </Space>
              ),
            },
          ]}
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
        />
      </div>
      <Modal
        centered
        width={900}
        open={location.hash === '#import-user-groups'}
        onCancel={() => navigate({ hash: '' })}
        footer={null}
      >
        <Typography.Title level={5}>
          Available groups to import voters from
        </Typography.Title>
        <div style={{ marginTop: '3rem' }}>
          <Table
            dataSource={groupList.data}
            columns={[
              {
                key: 'name',
                title: 'Name',
                render: (row) => row?.name,
              },
              {
                key: 'totalUsers',
                title: 'Total Users',
                render: (row) => (
                  <Typography.Text className="font-mono">
                    {row.totalUsers}
                  </Typography.Text>
                ),
              },
              {
                key: 'createdAt',
                title: 'Created At',
                render: (row) => (
                  <Typography.Text className="font-mono">
                    {isoDateFormat(row?.createdAt)}
                  </Typography.Text>
                ),
              },
              {
                key: 'actions',
                title: 'Actions',
                render: (row) => (
                  <>
                    <Button
                      onClick={() => {
                        setGroupData(row);
                        setDrawer(true);
                      }}
                    >
                      View Users
                    </Button>
                    <Button
                      type="primary"
                      className="mx-2"
                      disabled={status === 'closed'}
                      onClick={() => onImportAllVoters(row)}
                    >
                      Import
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </div>
      </Modal>

      <Drawer
        placement="right"
        title={groupData?.name}
        open={drawer}
        width={600}
        onClose={() => setDrawer(false)}
      >
        <>
          {groupData?.users?.map((user) => (
            <div key={user._id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserAvatarImage size={50} src={user.avatar} />
                  <Typography.Title level={5} className="m-3">
                    {user?.fullName || (
                      <span className="font-mono">{formatCnic(user.cnic)}</span>
                    )}
                  </Typography.Title>
                </div>
                <Button
                  size="small"
                  shape="round"
                  icon={<PlusOutlined />}
                  onClick={() => addSingleVoter.mutate(user)}
                  disabled={status === 'closed'}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
          {groupData?.users.length === 0 && (
            <Typography.Text>No users available</Typography.Text>
          )}
        </>
      </Drawer>
    </>
  );
};

export default Voters;
