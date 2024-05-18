import { ExclamationCircleOutlined } from '@ant-design/icons';
import { PageHeader, PageLoading } from '@ant-design/pro-components';
import {
  Button,
  Descriptions,
  Modal,
  Space,
  Tabs,
  Typography,
  message,
} from 'antd';
import React from 'react';
import { useMutation, useQuery } from 'react-query';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import ElectionCandidates from './candidates';
import ElectionDashboard from './dashboard';
import { ElectionStatus } from '../utils';
import ElectionSettings from './settings';
import { Content } from 'antd/es/layout/layout';
import { ElectionContext } from './context';
import request from '../../../utils/request';
import { isoDateFormat } from '../../../utils/helper';
import Voters from './voters';

const OrganizationElectionViewHandler = () => {
  const navigate = useNavigate();
  const { electionId } = useParams();
  const { orgId } = useParams();

  const electionDetail = useQuery(
    `org.elections:${electionId}`,
    async () => {
      const { data } = await request.get(
        `/organization/${orgId}/elections/${electionId}`,
      );
      return data;
    },
    {
      onError: (error) => {
        message.error(error.message);
        navigate(-1);
      },
    },
  );

  const startRequest = useMutation(
    () => {
      return request.post(
        `/organization/${orgId}/elections/${electionId}/start`,
      );
    },
    {
      onSuccess: () => {
        message.success('Election started successfully');
        electionDetail.refetch();
      },
      onError: (err) => message.error(err.message),
    },
  );

  const closeRequest = useMutation(
    () => {
      return request.post(
        `/organization/${orgId}/elections/${electionId}/close`,
      );
    },
    {
      onSuccess: (res) => {
        message.success('Election Closed successfully');
        electionDetail.refetch();
      },
      onError: (err) => message.error(err.message),
    },
  );

  if (electionDetail.isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        onBack={() => navigate(`/dashboard/org/${orgId}/elections`)}
        title={electionDetail?.data?.title}
        extra={[
          <Space>
            {electionDetail?.data.status === 'draft' && (
              <Button
                loading={startRequest.isLoading}
                onClick={startRequest.mutate}
              >
                Start
              </Button>
            )}
            {electionDetail?.data.status === 'active' && (
              <Button
                onClick={() =>
                  Modal.confirm({
                    centered: true,
                    icon: <ExclamationCircleOutlined />,
                    onOk: closeRequest.mutateAsync,
                    okText: 'Yes',
                    title: 'Are you sure to close this election?',
                  })
                }
              >
                Close
              </Button>
            )}
          </Space>,
        ]}
        footer={
          <Tabs
            defaultActiveKey=""
            onChange={navigate}
            items={[
              { key: '', label: 'Dashboard' },
              { key: 'voters', label: 'Voters List' },
              { key: 'candidates', label: 'Candidates' },
              { key: 'settings', label: 'Settings' },
            ]}
          />
        }
      >
        <Descriptions size="default" column={3}>
          <Descriptions.Item label="Created At">
            <span className="font-mono">
              {isoDateFormat(electionDetail?.data?.createdAt)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Started At">
            {electionDetail?.data?.startedAt ? (
              <span className="font-mono">
                {isoDateFormat(electionDetail?.data?.startedAt)}
              </span>
            ) : (
              '--'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Closed At">
            {electionDetail?.data?.closedAt ? (
              <span className="font-mono">
                {isoDateFormat(electionDetail?.data?.closedAt)}
              </span>
            ) : (
              '--'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {ElectionStatus[electionDetail?.data?.status]?.label}
          </Descriptions.Item>
        </Descriptions>
        {electionDetail?.data?.status === 'closed' && (
          <Typography.Text className="text-xs text-amber-700">
            Closed elections are not modifiable.
          </Typography.Text>
        )}
      </PageHeader>
      <ElectionContext.Provider value={{ ...electionDetail?.data }}>
        <Content style={{ padding: '2rem 1rem' }}>
          <Routes>
            <Route index element={<ElectionDashboard />} />
            <Route path="candidates" element={<ElectionCandidates />} />
            <Route path="voters" element={<Voters />} />
            <Route path="settings/*" element={<ElectionSettings />} />
          </Routes>
        </Content>
      </ElectionContext.Provider>
    </>
  );
};

export default OrganizationElectionViewHandler;
