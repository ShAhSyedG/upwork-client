import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  Modal,
  Select,
  Table,
  Typography,
  message,
} from 'antd';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import request from '../../../utils/request';
import { getCandidateSymbol, symbolOptions } from '../../assets/symbols';
import { formatCnic } from '../../../utils/helper';
import { useElectionContext } from './context';
import { useHandleHashRoutes } from '../../../hooks/use-handle-hash-routes';

const ElectionCandidates = () => {
  const electionDetail = useElectionContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [candidateSymbol, setCandidateSymbol] = React.useState(null);

  const { electionId, orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useHandleHashRoutes();

  const status = electionDetail.status;

  const usersList = useQuery(['organizationUsers', searchTerm], async () => {
    const { data } = await request.get(`/organization/${orgId}/users`, {
      params: {
        search: searchTerm,
      },
    });
    return data;
  });

  const candidatesList = useQuery(
    `org.elections:${electionId}.candidates`,
    async () => {
      const { data } = await request.get(
        `/organization/${orgId}/elections/${electionId}/candidates`,
      );
      return data;
    },
    { refetchOnMount: false },
  );

  const candidatesAdd = useMutation(
    async (payload) => {
      const { data } = await request.post(
        `/organization/${orgId}/elections/${electionId}/candidates`,
        { ...payload, symbol: candidateSymbol },
      );
      return data;
    },
    {
      onSuccess: (resp, payload) => {
        message.success(`Candidate '${payload?.cnic}' added`);
        candidatesList.refetch();
      },
      onError: (err, payload) =>
        message.error(`Candidate '${payload?.cnic}' adding failed`),
    },
  );

  const candidatesDelete = useMutation(
    async (payload) => {
      return request.delete(
        `/organization/${orgId}/elections/${electionId}/candidates/${payload._id}`,
      );
    },
    {
      onSuccess: (resp, payload) => {
        message.success(`Candidate '${payload?.user?.cnic}' deleted`);
        candidatesList.refetch();
      },
      onError: (err, payload) =>
        message.error(`Candidate '${payload?.user?.cnic}' deleting failed`),
    },
  );

  const showSymbol = (symbol) => {
    return (
      <div className="flex items-center">
        {getCandidateSymbol(symbol)}
        <span style={{ marginLeft: '.5rem' }}>{symbol}</span>
      </div>
    );
  };

  return (
    <>
      <div
        className="flex items-center justify-between"
        style={{
          marginBottom: '1rem',
        }}
      >
        <div />
        <Button
          onClick={() => navigate({ hash: 'addCandidate' })}
          type="primary"
          icon={<PlusOutlined />}
          disabled={status === 'closed'}
        >
          Add new
        </Button>
      </div>
      <Table
        dataSource={candidatesList?.data}
        loading={candidatesList.isLoading}
        bordered={false}
        columns={[
          {
            title: 'Symbol',
            render: (row) => showSymbol(row?.symbol) || '--',
          },
          {
            title: 'Full Name',
            render: (row) => row?.user?.fullName || '--',
          },
          {
            title: 'CNIC#',
            render: (row) => (
              <Typography.Text className="font-mono">
                {formatCnic(row.user.cnic)}
              </Typography.Text>
            ),
          },
          {
            title: 'Actions',
            render: (row) => (
              <Button
                danger
                type="default"
                icon={<DeleteOutlined />}
                disabled={status === 'closed'}
                onClick={() => candidatesDelete.mutate(row)}
              >
                Delete
              </Button>
            ),
          },
        ]}
      />

      <Modal
        title="Add Candidate"
        centered
        open={location.hash == '#addCandidate'}
        style={{ padding: '1rem' }}
        footer={null}
        width={700}
        onCancel={() => navigate({ hash: '' })}
      >
        <Form layout="vertical">
          <Form.Item style={{ margin: '1rem 0px' }}>
            <Input
              placeholder="Search User"
              onChange={({ target }) => setSearchTerm(target.value)}
              loading={usersList?.isLoading}
            />
          </Form.Item>
          <List
            header={null}
            footer={null}
            style={{ height: '30vh', overflowY: 'scroll' }}
            dataSource={usersList?.data}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Select
                    className="text-start"
                    style={{ width: '10rem' }}
                    defaultValue="Select a Symbol"
                    onSelect={(value) => setCandidateSymbol(value)}
                  >
                    {symbolOptions.map((entry) => (
                      <Select.Option key={entry.value} className="text-start">
                        {entry.label}&nbsp;&nbsp;
                        {entry.value}
                      </Select.Option>
                    ))}
                  </Select>,
                  <Button
                    size="small"
                    type="ghost"
                    shape="round"
                    icon={<PlusOutlined />}
                    onClick={() => candidatesAdd.mutate(item.user)}
                  >
                    Add
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        verticalAlign: 'middle',
                      }}
                      size="large"
                    >
                      {item?.user?.cnic}
                    </Avatar>
                  }
                  title={
                    <Typography.Text>
                      {item?.user?.fullName || (
                        <span className="font-mono">
                          {formatCnic(item?.user?.cnic)}
                        </span>
                      )}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        </Form>
      </Modal>
    </>
  );
};
export default ElectionCandidates;
