import React from 'react';
import { PageHeader } from '@ant-design/pro-components';
import { Button, Segmented, Space, Table, Typography, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import { useMutation, useQuery } from 'react-query';
import { isoDateFormat } from '../../utils/helper';

import request from '../../utils/request';

const OragnizationElectionListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { orgId } = useParams();

  const status = searchParams.get('status') || 'active';
  const electionList = useQuery(
    `org:elections:${status}`,
    async () => {
      const { data } = await request.get(
        `/organization/${orgId}/elections?status=${status}`,
      );
      return data;
    },
    { refetchOnMount: false },
  );

  const electionDelete = useMutation(
    async (payload) => {
      const res = await request.delete(
        `/organization/${orgId}/elections/${payload._id}`,
      );
      return res;
    },
    {
      onSuccess: (data, election) => {
        message.success(`Election '${election.title}' deleted`);
        electionList.refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );

  return (
    <>
      <PageHeader
        title="Elections"
        extra={[
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => navigate('create')}
          >
            Create new
          </Button>,
        ]}
      ></PageHeader>

      <Content style={{ margin: '1rem' }}>
        <Space direction="vertical" style={{ marginBlock: '1rem' }}>
          <Segmented
            onChange={(entry) => setSearchParams({ status: entry })}
            value={status}
            size="middle"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Closed', value: 'closed' },
              { label: 'Draft', value: 'draft' },
            ]}
          />
        </Space>

        <Table
          dataSource={electionList?.data}
          loading={electionList?.isLoading}
          className="cursor-pointer"
          columns={[
            {
              title: 'Title',
              dataIndex: 'title',
              key: 'title',
            },
            {
              title: 'Created At',
              render: (entry) => (
                <Typography.Text className="font-mono">
                  {isoDateFormat(entry.createdAt)}
                </Typography.Text>
              ),
              key: 'createdAt',
            },
            {
              title: 'Started At',
              // render: (entry) => isoDateFormat(entry?.schedule?.from),
              render: (entry) => (
                <Typography.Text className="font-mono">
                  {isoDateFormat(entry?.startedAt)}
                </Typography.Text>
              ),
              key: 'startedAt',
            },
            {
              title: 'Closed At',
              // render: (entry) => isoDateFormat(entry?.schedule?.to),
              render: (entry) => (
                <Typography.Text className="font-mono">
                  {isoDateFormat(entry?.closedAt)}
                </Typography.Text>
              ),
              key: 'closedAt',
            },
            {
              title: 'Actions',
              render: (entry) => (
                <Space>
                  <Button
                    danger
                    type="default"
                    size="small"
                    disabled={entry.status === 'closed'}
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      electionDelete.mutate(entry);
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          onRow={(record) => {
            return {
              onClick: () => navigate(`./${record._id}`),
            };
          }}
        />
      </Content>
    </>
  );
};

export default OragnizationElectionListPage;
