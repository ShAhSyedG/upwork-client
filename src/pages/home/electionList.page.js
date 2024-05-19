import { PageHeader } from '@ant-design/pro-components';
import {
  Card,
  Col,
  Descriptions,
  Layout,
  List,
  Row,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import request from '../../utils/request';
import UserDropDown from '../../components/userDropdown';
import { isoDateFormat } from '../../utils/helper';
import CountdownTimer from '../../components/countdown-timer';

const HomeElectionsListPage = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState('all');
  const electionList = useQuery(`home.elections:${tab}`, async () => {
    const { data } = await request.get(`/home/elections?filter=${tab}`);
    return data;
  });

  return (
    <Layout style={{ padding: '1em' }}>
      <PageHeader title="Elections" extra={<UserDropDown />} />

      <Row gutter={[20, 20]}>
        <Col span={6}>
          <Card className="home-elections-filter">
            <Tabs tabPosition="left" onChange={setTab} defaultActiveKey={tab}>
              <Tabs.TabPane tab="All" key="all" />
              {/* <Tabs.TabPane tab="Voted" key="voted" /> */}
              <Tabs.TabPane tab="Running Elections" key="active" />
              <Tabs.TabPane tab="Closed Elections" key="closed" />
              <Tabs.TabPane tab="My Votes" key="voted" />
              <Tabs.TabPane tab="My Elections" key="my" />
            </Tabs>
          </Card>
        </Col>

        <Col span={18}>
          <List
            pagination={true}
            dataSource={electionList?.data}
            loading={electionList.isLoading}
            renderItem={(item) => (
              <ElectionItem
                {...item}
                onClick={() => navigate(`./${item._id}`)}
              />
            )}
          />
        </Col>
      </Row>
    </Layout>
  );
};

const ElectionItem = ({
  title,
  description,
  createdAt,
  organization,
  onClick,
  closedAt,
  startedAt,
  schedule,
  status,
  voted,
}) => {
  const statusColor = status === 'closed' ? 'red' : 'green';

  return (
    <Card className="election-item-2" onClick={onClick}>
      <div className="flex items-center justify-between">
        <Typography.Title
          level={4}
          className="w-full"
          style={{ marginTop: '0px' }}
        >
          {title}
        </Typography.Title>
        {status !== 'closed' && schedule && (
          <Descriptions style={{ width: '25rem' }}>
            <Descriptions.Item label="Remaining Time">
              <CountdownTimer endDate={schedule?.to} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
      <Descriptions>
        <Descriptions.Item label="Description">
          {description ?? '--'}
        </Descriptions.Item>
        <Descriptions.Item label="Orgnaization">
          {organization?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          <span className="font-mono">{isoDateFormat(createdAt)}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Started At">
          <span className="font-mono">
            {isoDateFormat(schedule?.from || startedAt)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Closed At">
          <span className="font-mono">{isoDateFormat(closedAt)}</span>
        </Descriptions.Item>
      </Descriptions>
      <div style={{ textAlign: 'end', marginTop: '1rem' }}>
        <p className="capitalize font-bold m-0" style={{ color: statusColor }}>
          {status}
        </p>
      </div>
      {voted && <Tag color="success">Voted</Tag>}
    </Card>
  );
};

export default HomeElectionsListPage;
