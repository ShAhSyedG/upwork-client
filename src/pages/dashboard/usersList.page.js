import { PageHeader } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import request from '../../utils/request';
import React, { useState } from 'react';
import { formatCnic, isoDateFormat } from '../../utils/helper';
import { useForm } from 'antd/es/form/Form';
import papa from 'papaparse';
import { useHandleHashRoutes } from '../../hooks/use-handle-hash-routes';

const OrganizationUsersListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useHandleHashRoutes();

  const [editUser, setEditUser] = useState(null);
  const [tags, setTags] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [form] = useForm();
  const { orgId } = useParams();

  // Fetch Users list
  const usersList = useQuery(`org:${orgId}.users`, async (payload) => {
    const { data } = await request.get(`/organization/${orgId}/users`);
    return data;
  });

  const groupList = useQuery(`org:${orgId}.usersGroups`, async () => {
    const { data } = await request.get(`/organization/${orgId}/usersGroups`);
    return data;
  });

  const csv = csvData.flatMap((data) => Object.values(data).toString());
  // Add new User
  const usersAdd = useMutation(
    async (payload) => {
      const data = await request.post(`/organization/${orgId}/users`, {
        ...payload,
        cnic: csv.length === 0 ? payload.cnic : csv,
      });
      return data;
    },
    {
      onSuccess: (response, payload) => {
        navigate({ hash: '' });
        if (payload?.cnic?.length > 1 || csv.length >= 1) {
          message.success('Users Added');
        } else {
          message.success(`User '${payload?.cnic[0]}' Added`);
        }
        setTags([]);
        form.resetFields();
        usersList.refetch();
      },
      onError: (error) => {
        message.error(error?.message);
      },
    },
  );

  // Delete a user
  const usersDelete = useMutation(
    async (payload) => {
      return request.delete(`/organization/${orgId}/users/${payload.user._id}`);
    },
    {
      onSuccess: (response, payload) => {
        usersList.refetch();
        message.success(`User '${payload.user?.cnic}' Deleted`);
      },
      onError: (response) => message.error(response.message),
    },
  );

  const userUpdate = useMutation(
    async (payload) => {
      return request.put(
        `/organization/${orgId}/users/${editUser._id}`,
        payload,
      );
    },
    {
      onSuccess: (response, payload) => {
        message.success(`User Updated`);
        onModalClose();
        usersList.refetch();
      },
      onError: (response) => message.error(response.message),
    },
  );

  const onModalClose = () => {
    form.resetFields();
    if (editUser) setEditUser(null);
    else navigate({ hash: '' });
  };

  React.useEffect(() => {
    form.setFieldsValue({
      groups: editUser ? editUser?.groups?.map((e) => e._id) : [],
    });
  }, [editUser]);

  const isAdmin = Form.useWatch('isAdmin', form);
  const bulkAdminRestrict = (tags.length > 5 || csvData.length > 5) && isAdmin;
  const bulkAdminWarning =
    (tags.length <= 5 || csvData.length <= 5) &&
    (tags.length !== 0 || csvData.length !== 0) &&
    isAdmin;

  return (
    <>
      <PageHeader
        title="Users"
        extra={[
          <Button
            onClick={() => {
              navigate({ hash: 'addUser' });
              setTags([]);
            }}
            icon={<PlusOutlined />}
            type="primary"
          >
            Add New
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ margin: '1rem', width: '100%' }}>
        <Table
          pagination={{ position: ['none', 'bottomCenter'] }}
          dataSource={usersList.data || []}
          loading={usersList.isLoading}
          columns={[
            {
              title: 'Name',
              render: (row) => row.user?.fullName || '--',
            },
            {
              title: 'CNIC #',
              render: (row) => (
                <Typography.Text className="font-mono">
                  {formatCnic(row.user?.cnic)}
                </Typography.Text>
              ),
            },
            {
              title: 'Added At',
              render: (row) => (
                <Typography.Text className="font-mono">
                  {isoDateFormat(row?.user?.createdAt)}
                </Typography.Text>
              ),
            },
            {
              title: 'Is Admin',
              render: (row) =>
                row.isAdmin ? (
                  <Tag color="processing" bordered={false}>
                    Admin
                  </Tag>
                ) : (
                  <Tag bordered={false}>User</Tag>
                ),
            },
            {
              title: 'Group',
              render: (row) =>
                row?.groups?.map((entry) => (
                  <Tag bordered={false}>{entry.name}</Tag>
                )),
            },

            {
              title: 'Actions',
              render: (row) => (
                <Space size="small">
                  <Button
                    size="small"
                    icon={<SettingOutlined />}
                    type="default"
                    onClick={() => setEditUser(row)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    onClick={() => usersDelete.mutate(row)}
                    icon={<DeleteOutlined />}
                    type="default"
                    danger
                  >
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Space>
      <Modal
        centered
        title={editUser ? 'Edit User' : 'Add new User'}
        footer={null}
        style={{ padding: '1rem' }}
        open={location.hash == '#addUser' || editUser}
        onCancel={onModalClose}
      >
        <Form.Provider
          onFormFinish={(name, { values, forms }) =>
            console.log({
              name,
              values,
              forms,
            })
          }
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={editUser ? userUpdate.mutate : usersAdd.mutate}
            style={{ paddingBlock: '1rem' }}
          >
            <Form.Item
              name="cnic"
              label="Cnic #"
              valuePropName="tags"
              getValueFromEvent={(tags) => tags}
              initialValues={editUser ? editUser.user.cnic : ''}
            >
              <AppTagsInputField
                value={tags}
                onChange={setTags}
                editUser={editUser}
                csvData={csvData}
              />
            </Form.Item>
            {!editUser && (
              <>
                <Form.Item
                  name="isAdmin"
                  label="Is Admin"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                {bulkAdminRestrict ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <Typography.Text type="danger">
                      Only upto 5 Admins can be created at a time
                    </Typography.Text>
                  </div>
                ) : bulkAdminWarning ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <Typography.Text type="warning">
                      All users will be assigned the Admin role
                    </Typography.Text>
                  </div>
                ) : null}
              </>
            )}

            <Form.Item name="groups" label="Group">
              <Select
                mode="multiple"
                placeholder="Add to Group"
                disabled={groupList.isLoading}
                options={
                  groupList?.data?.map((entry) => {
                    return {
                      label: entry?.name,
                      value: entry?._id,
                    };
                  }) || []
                }
              />
            </Form.Item>

            <div
              className="flex items-center justify-between"
              style={{ marginTop: '3rem' }}
            >
              {!editUser && (
                <div style={{ width: '10rem' }}>
                  <Upload
                    accept=".csv"
                    beforeUpload={(file) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        papa.parse(e.target.result, {
                          header: false,
                          dynamicTyping: true,
                          complete: function (results) {
                            const data = results.data;
                            setCsvData(data);
                            setOpenDrawer(true);
                          },
                        });
                      };
                      reader.readAsText(file);
                      return false; // Prevent upload
                    }}
                    onRemove={() => {
                      setCsvData([]);
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Upload CSV</Button>
                  </Upload>
                </div>
              )}
              <div className="flex items-center" style={{ marginLeft: 'auto' }}>
                <Button onClick={onModalClose}>Cancel</Button>
                &nbsp;&nbsp;
                <Button
                  type="primary"
                  loading={editUser ? userUpdate.isLoading : usersAdd.isLoading}
                  disabled={editUser ? false : bulkAdminRestrict}
                  htmlType="submit"
                >
                  {editUser ? 'Save' : 'Add'}
                </Button>
              </div>
            </div>
          </Form>
        </Form.Provider>
      </Modal>

      <Drawer
        title="Cnic # from CSV"
        placement="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <div>
          {csvData?.map((entry, index) => (
            <div
              className="flex items-center"
              style={{ marginBottom: '.5rem' }}
            >
              <Typography.Text>{index + 1} - </Typography.Text>
              <Typography.Title level={5} style={{ margin: '0 1rem' }}>
                {Object.values(entry)}
              </Typography.Title>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};
export default OrganizationUsersListPage;

const AppTagsInputField = ({
  value: tags = [],
  onChange,
  editUser,
  csvData,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const cnicNumber = e.target.value.trim();
    setInputValue(e.target.value);

    if (!cnicNumber.match(/^\d+$/)) {
      setError('Cnic # must only contain numbers');
    } else if (cnicNumber.length < 13) {
      setError('Cnic # cannot be less than 13 digits');
    } else if (cnicNumber.length > 13) {
      setError('Cnic # cannot be greater than 13 digits');
    } else {
      setError(null);
    }
  };

  const handleInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && !error) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag) {
        const newTags = [...tags, newTag];
        onChange(newTags);
        setInputValue('');
      }
    }
  };

  const handleTagRemove = (tag) => {
    const updatedTags = tags?.filter((t) => t !== tag);
    onChange(updatedTags);
  };

  const handleClearAll = () => onChange([]);

  return (
    <>
      <div>
        <div style={{ marginBlock: '.4rem' }}>
          {tags?.map((tag, index) => (
            <Tag
              closable
              key={tag}
              onClose={() => handleTagRemove(tag)}
              style={{ marginBlock: '.2rem' }}
            >
              {tag}
            </Tag>
          ))}
          {tags.length > 3 && (
            <Button size="small" onClick={handleClearAll}>
              Clear
            </Button>
          )}
        </div>

        <Input
          type="text"
          name="cnic"
          value={editUser ? editUser.user.cnic : inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          disabled={editUser || csvData.length !== 0}
          placeholder="Type and press Enter to add tags (or use a comma)"
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    </>
  );
};
