import { Area } from '@ant-design/plots';
import { Card, Col, Row, Space, Statistic } from 'antd';
import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import request from '../../../utils/request';

const ElectionDashboard = () => {
  const { electionId, orgId } = useParams();

  const electionStats = useQuery(
    `org.elections:${electionId}.stats`,
    async () => {
      const { data } = await request.get(
        `/organization/${orgId}/elections/${electionId}/stats`,
      );
      return data;
    },
    { refetchOnMount: false, refetchInterval: 10000 },
  );

  const votesPolled = electionStats?.data?.votesPolled || 0;
  const totalVoters = electionStats?.data?.totalVoters || 0;
  const nullifiedVotes = electionStats?.data?.nullifiedVotes || 0;
  const votesPolledByHour = electionStats?.data?.votesPolledByHour || 0;

  const turnout = totalVoters !== 0 ? (votesPolled / totalVoters) * 100 : 0;

  return (
    <>
      <Row gutter={16}>
        <Col span={16}>
          <Space size={16} direction="vertical" className="w-full">
            <Row gutter={16}>
              <Col>
                <Card>
                  <div className="flex">
                    <Statistic
                      title="Votes Casted"
                      value={votesPolled}
                      valueStyle={{ fontFamily: 'Space mono' }}
                      loading={electionStats.isLoading}
                    />
                    <div className="mx-5">
                      <Statistic
                        title="Total Voters"
                        value={totalVoters}
                        valueStyle={{ fontFamily: 'Space mono' }}
                        loading={electionStats.isLoading}
                      />
                    </div>
                    <div className="mr-2">
                      <Statistic
                        title="Nullified Votes"
                        value={nullifiedVotes}
                        valueStyle={{ fontFamily: 'Space mono' }}
                        loading={electionStats.isLoading}
                      />
                    </div>
                    <Statistic
                      title="Turnout"
                      value={`${Math.round(turnout || 0)}%`}
                      valueStyle={{ fontFamily: 'Space mono' }}
                      loading={electionStats.isLoading}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
            <Card>
              <Area
                data={votesPolledByHour || []}
                xField="time"
                yField="votes"
                smooth={true}
                animation={false}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </>
  );
};

export default ElectionDashboard;
