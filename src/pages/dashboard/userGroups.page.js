import React from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-components';
import {
  Button,
  Form,
  Input,
  Modal,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';
import { Content } from 'antd/es/layout/layout';
import { formatCnic, isoDateFormat } from '../../utils/helper';
import papa from 'papaparse';
import { useHandleHashRoutes } from '../../hooks/use-handle-hash-routes';

const UserGroupsPage = () => {
  const [editGroupCnic, setEditGroupCnic] = React.useState([]);
  const [groupData, setGroupData] = React.useState({
    user: null,
    group: null,
  });
  const { orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useHandleHashRoutes();
  const [form] = Form.useForm();

  const csvCnic = editGroupCnic.flatMap((data) =>
    Object.values(data).toString(),
  );

  const groupList = useQuery(`org:${orgId}.usersGroups`, async () => {
    const { data } = await request.get(`/organization/${orgId}/usersGroups`);
    return data;
  });

  // // Fetch Users list
  const groupCreate = useMutation(
    (payload) => {
      return request.post(`/organization/${orgId}/usersGroups`, payload);
    },
    {
      onSuccess: (response, payload) => {
        message.success(`Group '${payload.name}' created successfully`);
        navigate({ hash: '' });
        groupList.refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );

  // update group
  const groupUpdate = useMutation(
    (payload) => {
      return request.post(`/organization/${orgId}/usersGroups/update`, {
        _id: payload._id,
        name: payload.name,
        ...(csvCnic.length > 0 && { userCnic: csvCnic }),
      });
    },
    {
      onSuccess: (res, payload) => {
        message.success(`Group '${payload.name}' updated successfully`);
        navigate({ hash: '' });
        groupList.refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );

  const groupDelete = useMutation(
    (payload) => {
      return request.post(`/organization/${orgId}/usersGroups/delete`, {
        _id: payload._id,
      });
    },
    {
      onSuccess: (res, payload) => {
        message.success(`Group '${payload.name}' deleted successfully.`);
        groupList.refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );

  const removeUser = useMutation(
    async (payload) => {
      return request.post(
        `/organization/${orgId}/usersGroups/remove-user`,
        payload,
      );
    },
    {
      onSuccess: (res, payload) => {
        message.success(res.message);
        groupList.refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );

  if (!groupCreate.isLoading) {
    form.resetFields();
  }

  if (location.hash === '#edit-group') {
    form.setFieldsValue({
      name: groupData?.group?.name,
    });
  }

  return (
    <>
      <PageHeader
        title="Users Groups"
        extra={[
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => navigate({ hash: 'create-group' })}
          >
            Create new
          </Button>,
        ]}
      />

      <Content style={{ margin: '1rem' }}>
        <Table
          pagination={{ position: ['none', 'bottomCenter'] }}
          dataSource={groupList?.data || []}
          loading={groupList.isLoading}
          columns={[
            {
              title: 'Name',
              render: (row) => row?.name,
            },
            {
              title: 'Total Users',
              render: (row) => row?.totalUsers,
            },
            {
              title: 'Created At',
              render: (row) => (
                <Typography.Text className="font-mono">
                  {isoDateFormat(row?.createdAt)}
                </Typography.Text>
              ),
            },
            {
              title: 'Actions',
              render: (row) => (
                <>
                  <Button
                    onClick={() => {
                      navigate({ hash: 'view-group-users' });
                      setGroupData({
                        user: row.users,
                        groupId: row._id,
                      });
                    }}
                  >
                    View Users
                  </Button>
                  <Button
                    style={{ marginInline: '.5rem' }}
                    onClick={() => {
                      navigate({ hash: 'edit-group' });
                      setGroupData({
                        user: null,
                        group: row,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      groupDelete.mutate(row);
                    }}
                  >
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
        />
      </Content>

      {/* CREATE GROUP  */}
      <Modal
        centered
        title="Create new Group"
        footer={null}
        open={location.hash === '#create-group'}
        style={{ padding: '1rem' }}
        onCancel={() => navigate({ hash: '' })}
      >
        <Form
          hasFeedback
          layout="vertical"
          form={form}
          onFinish={groupCreate.mutate}
          style={{ paddingBlock: '1rem' }}
        >
          <Form.Item
            name="name"
            label="Name"
            initialValues={{
              name: '',
            }}
            rules={[
              { required: true },
              {
                max: 60,
                message: 'Maximum 60 characters allowed',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <div className="flex items-center justify-end">
            <Button onClick={() => navigate({ hash: '' })}>Cancel</Button>
            &nbsp;&nbsp;
            <Button
              type="primary"
              loading={groupCreate.isLoading}
              htmlType="submit"
            >
              Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* VIEW GROUP USERS  */}
      <Modal
        centered
        open={location.hash === '#view-group-users'}
        footer={null}
        onCancel={() => navigate({ hash: '' })}
        width={750}
      >
        <Typography.Title level={4}>List of Users</Typography.Title>
        <div>
          <Table
            dataSource={groupData?.user}
            loading={groupList.isLoading}
            columns={[
              {
                title: 'Cnic #',
                render: (row) => (
                  <Typography.Text className="font-mono">
                    {formatCnic(row.cnic)}
                  </Typography.Text>
                ),
              },
              {
                title: 'Fullname',
                render: (row) => (
                  <div>
                    <Typography.Text>{row?.fullName || '--'}</Typography.Text>
                  </div>
                ),
              },
              {
                title: 'Created At',
                render: (row) => (
                  <Typography.Text className="font-mono">
                    {isoDateFormat(row.createdAt)}
                  </Typography.Text>
                ),
              },
              {
                title: 'Actions',
                render: (entry) => (
                  <Button
                    danger
                    type="default"
                    size="small"
                    disabled={entry.status === 'closed'}
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      removeUser.mutate({
                        _id: entry._id,
                        groupId: groupData.groupId,
                      })
                    }
                  >
                    Remove
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </Modal>

      {/* EDIT GROUP  */}
      <Modal
        centered
        title="Update Group"
        open={location.hash === '#edit-group'}
        onCancel={() => navigate({ hash: '' })}
        footer={null}
      >
        <Form
          name="edit-group"
          form={form}
          onFinish={(value) =>
            groupUpdate.mutate({
              _id: groupData?.group?._id,
              name: value.name,
            })
          }
        >
          <Form.Item
            label="Group Name"
            name="name"
            rules={[
              { required: true },
              {
                max: 60,
                message: 'Maximum 60 characters allowed',
              },
            ]}
          >
            <Input placeholder="Enter Group Name" />
          </Form.Item>

          <div className="flex items-center justify-between mt-5">
            <Form.Item>
              <Upload
                accept=".csv"
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    papa.parse(e.target.result, {
                      header: false,
                      dynamicTyping: true,
                      skipEmptyLines: true,
                      complete: function (results) {
                        const data = results.data;
                        setEditGroupCnic(data);
                      },
                    });
                  };
                  reader.readAsText(file);
                  return false; // Prevent upload
                }}
                onRemove={() => {
                  setEditGroupCnic([]);
                }}
              >
                <Button icon={<UploadOutlined />}>Upload CSV</Button>
              </Upload>
            </Form.Item>
            <Form.Item className="flex justify-end">
              <Button onClick={() => navigate({ hash: '' })}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: '.5rem' }}
              >
                Update
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default UserGroupsPage;
