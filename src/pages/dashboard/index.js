import { Card, Descriptions, Divider, Space, Typography } from 'antd';
import { useQuery } from 'react-query';
import request from '../../utils/request';
import { useParams } from 'react-router-dom';

const DashboardPage = () => {
  const { orgId } = useParams();

  const orgStats = useQuery('org-stats', async () => {
    const { data } = await request.get(
      `/organization/${orgId}/org-dashboard-stats`,
    );
    return data;
  });

  const elections = [
    {
      title: 'Elections',
      children: [
        {
          title: 'Total Elections',
          stat: orgStats?.data?.elections?.totalElections || '--',
        },
        {
          title: 'Open Elections',
          stat: orgStats?.data?.elections?.active || '--',
        },
        {
          title: 'Closed Elections',
          stat: orgStats?.data?.elections?.closed || '--',
        },
        {
          title: 'Scheduled Elections',
          stat: orgStats?.data?.elections?.scheduled || '--',
        },
      ],
    },
  ];

  const stats = [
    { title: 'Total Users', stat: orgStats?.data?.users[0]?.count || '--' },
    { title: 'Total Groups', stat: orgStats?.data?.groups || '--' },
  ];

  return (
    <>
      <div
        style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'start',
        }}
      >
        <Space direction="horizontal" size="middle">
          {elections?.map((election) => (
            <>
              <Card>
                <Typography.Title level={4}>{election.title}</Typography.Title>
                <Divider />
                {election.children.map((detail) => (
                  <Space direction="vertical" size="middle">
                    <Descriptions>
                      <Descriptions.Item label={detail.title}>
                        <span className="font-mono">{detail.stat}</span>
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                ))}
              </Card>
            </>
          ))}
        </Space>
        <Space direction="horizontal" style={{ marginLeft: '1rem' }}>
          {stats.map(({ title, stat }) => (
            <Card>
              <Typography.Title level={4}>{title}</Typography.Title>
              <Typography.Paragraph className="font-mono">
                {stat}
              </Typography.Paragraph>
            </Card>
          ))}
        </Space>
      </div>
    </>
  );
};

export default DashboardPage;
