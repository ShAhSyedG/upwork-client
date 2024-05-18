import './home.css';

import React from 'react';
import {
  Card,
  Col,
  Row,
  Typography,
  Table,
  Button,
  Avatar,
  Layout,
  Modal,
  Space,
  Descriptions,
  Statistic,
  Tag,
  Divider,
  Checkbox,
  Spin,
} from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import UserDropDown from '../../components/userDropdown';
import request from '../../utils/request';
import _ from 'lodash';
import { formatCnic, isoDateFormat } from '../../utils/helper';
import { getCandidateSymbol } from '../assets/symbols';
import { UserAvatarImage } from '../../components/user-data';
import CountdownTimer from '../../components/countdown-timer';
import SignVote from './election-voting/sign-vote';
import { useHandleHashRoutes } from '../../hooks/use-handle-hash-routes';

const ElectionViewContext = React.createContext(undefined);

export const useElectionViewContext = () => {
  const ctx = React.useContext(ElectionViewContext);
  if (ctx === undefined) {
    throw new Error(
      'useElectionViewContext should be used inside ElectionViewContext.Provider',
    );
  }
  return ctx;
};

const HomeElectionViewPage = () => {
  const [selectedCandidate, setSelectedCandidate] = React.useState({});
  const [qrCode, setQrCode] = React.useState('');
  const [nullified, setNullified] = React.useState(false);
  const [visibleData, setVisibleData] = React.useState({
    orgName: null,
    electionName: null,
    candidate: null,
    symbol: null,
  });
  const [vote, setVote] = React.useState({
    candidate: null,
    candidateName: null,
  });

  const { electionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useHandleHashRoutes();

  const electionDetail = useQuery(`home.elections:${electionId}`, async () => {
    const { data } = await request.get(`/home/elections/${electionId}`);
    return data[0];
  });

  const electionResult = useQuery(
    `home.elections:${electionId}.result`,
    async () => {
      const { data } = await request.get(
        `/home/elections/${electionId}/result`,
      );
      return data;
    },
    {
      enabled: electionDetail?.data?.status === 'closed',
    },
  );

  const candidateWithMostVotes =
    electionResult?.data &&
    electionResult?.data.votesByCandidate.reduce(
      (prev, current) => {
        return current.votes > prev.votes ? current : prev;
      },
      { votes: 0 },
    );

  const resultColumn = [
    {
      title: 'Candidate',
      render: (row) => (
        <Space>
          <Avatar />
          <span className="font-mono">{formatCnic(row?.user?.cnic)}</span>
        </Space>
      ),
    },
    {
      title: 'Votes',
      render: (row) => {
        const { votesByCandidate } = electionResult?.data;
        const total = _.find(votesByCandidate, { _id: row?._id })?.votes || 0;
        return <span className="font-mono">{total}</span>;
      },
    },
    {
      title: 'Percentage',
      render: (row) => {
        const { votesByCandidate } = electionResult?.data;
        const count = _.find(votesByCandidate, { _id: row._id })?.votes || 0;
        const percentage =
          (count / electionResult?.data?.votesTotal) * 100 || 0;
        return <span className="font-mono">{`${percentage}%`}</span>;
      },
    },
  ];

  const notInVotersList = electionDetail?.data?.notInVotersList === false;

  return (
    <ElectionViewContext.Provider
      value={{
        electionDetail,
        selectedCandidate,
        qrCode,
        nullified,
        notInVotersList,
        setQrCode,
        setVisibleData,
        setSelectedCandidate,
        setVote,
        setNullified,
      }}
    >
      <Layout style={{ padding: '1em' }}>
        <PageHeader
          title={electionDetail.data?.title || 'election'}
          onBack={() => navigate('/elections')}
          extra={
            <Space>
              <UserDropDown />
            </Space>
          }
        />

        <Row gutter={[30, 40]}>
          <Col md={16} sm={12}>
            <Space size={10} direction="vertical" className="w-full">
              <Card>
                <Descriptions column={1}>
                  <Descriptions.Item
                    label="Description"
                    style={{ paddingBottom: '0px' }}
                  >
                    {electionDetail?.data?.description || '---'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
              {notInVotersList && electionDetail?.data?.status !== 'closed' && (
                <Typography.Text className="text-red-500 flex justify-center">
                  You do not have the permission to cast a vote in this election
                </Typography.Text>
              )}
              <Card
                title="Candidates"
                extra={
                  electionDetail?.data?.status === 'active' &&
                  !electionDetail?.data?.voted ? (
                    <Button
                      type="primary"
                      className="w-full"
                      disabled={
                        (vote.candidate === null && !nullified) ||
                        notInVotersList
                      }
                      onClick={() => {
                        navigate({ hash: 'vote' });
                        setQrCode('');
                      }}
                    >
                      Vote
                    </Button>
                  ) : electionDetail.isLoading ? (
                    <Spin />
                  ) : (
                    <Tag color="success">Voted</Tag>
                  )
                }
              >
                {electionDetail.isLoading && (
                  <div className="flex items-center justify-center">
                    <Spin />
                  </div>
                )}
                <div className="grid grid-cols-4">
                  {electionDetail?.data?.candidates.map((item) => (
                    <CandidateSelectionCard key={item?.user.cnic} item={item} />
                  ))}
                </div>
                <Divider plain type="horizontal" orientation="center">
                  or
                </Divider>

                <div className="flex flex-col">
                  <Checkbox
                    checked={nullified}
                    onChange={() => {
                      setNullified(!nullified);
                      setSelectedCandidate(null);
                      setVote({ candidate: null });
                      const newVisibleData = {
                        orgName: electionDetail?.data?.organization?.name,
                        electionName: electionDetail?.data?.title,
                        symbol: '--',
                        candidate: 'Nullify',
                      };
                      setVisibleData(newVisibleData);
                    }}
                    disabled={
                      (electionDetail?.data?.status === 'active' &&
                        electionDetail?.data?.voted) ||
                      electionDetail?.data?.status === 'closed' ||
                      notInVotersList
                    }
                  >
                    Nullify Vote
                  </Checkbox>
                  <Typography.Text className="text-xs mt-3 text-amber-700">
                    Nullify vote means that you don't intend to vote to any of
                    the candidates but still want to vote.
                  </Typography.Text>
                  <Typography.Text className="text-xs mt-3 text-amber-700 text-end">
                    ووٹ کو کالعدم کرنے کا مطلب ہے کہ آپ کسی بھی امیدوار کو ووٹ
                    دینے کا ارادہ نہیں رکھتے لیکن پھر بھی ووٹ دینا چاہتے ہیں۔
                  </Typography.Text>
                </div>
              </Card>

              {electionResult?.isSuccess && (
                <Card title="Result">
                  <Space size={30} direction="vertical" className="w-full">
                    <Row gutter={16}>
                      <Col className="flex items-center">
                        <Statistic
                          title="Total Votes Casted"
                          value={electionResult.data.votesTotal}
                          valueStyle={{ fontFamily: 'Space Mono' }}
                        />
                        <Statistic
                          title="Votes to Candidate"
                          value={electionResult?.data?.votesByCandidate?.length}
                          valueStyle={{ fontFamily: 'Space Mono' }}
                          className="mx-4"
                        />
                        <Statistic
                          title="Nullified Votes Casted"
                          value={electionResult.data.nullifiedVotes}
                          valueStyle={{ fontFamily: 'Space Mono' }}
                        />
                      </Col>
                    </Row>
                    <Table
                      loading={electionResult?.isLoading}
                      dataSource={electionDetail?.data?.candidates}
                      columns={resultColumn}
                      rowClassName={(record) =>
                        candidateWithMostVotes &&
                        record?._id === candidateWithMostVotes._id
                          ? 'green'
                          : ''
                      }
                    />
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
          <SideBar />
        </Row>

        <Modal
          centered
          width={800}
          open={location.hash === '#vote'}
          onCancel={() => navigate({ hash: '' })}
          footer={null}
        >
          <Typography.Text>{electionDetail.data?.title}</Typography.Text>
          <div className="flex items-center justify-between">
            {nullified && (
              <div className="flex items-center justify-center w-half">
                <Typography.Text className="text-amber-700">
                  You have nullified the vote.
                </Typography.Text>
              </div>
            )}
            {!nullified && (
              <div className="flex flex-col items-center jusitfy-center w-half">
                <p className="font-bold text-lg">Selected Candidate</p>
                <div className="relative">
                  <UserAvatarImage
                    size={100}
                    src={selectedCandidate?.user?.avatar}
                  />
                  {selectedCandidate?.symbol && (
                    <div className="absolute flex items-center justify-center symbol-wrapper">
                      <span>
                        {getCandidateSymbol(selectedCandidate?.symbol)}
                      </span>
                    </div>
                  )}
                </div>
                <Typography.Text className="text-center">
                  {selectedCandidate?.user?.fullName || (
                    <span className="font-mono">
                      {formatCnic(selectedCandidate?.user?.cnic)}
                    </span>
                  )}
                </Typography.Text>
              </div>
            )}

            <div
              className="w-half flex items-center justify-center"
              style={{ height: '330px' }}
            >
              <SignVote candidate={vote.candidate} visibleData={visibleData} />
            </div>
          </div>

          <div
            className="flex items-center justify-end"
            style={{ marginTop: '2rem' }}
          >
            <p style={{ color: '#A8A29E', margin: '.3rem .5rem 0 0' }}>
              Powered by
            </p>
            <img
              src="/images/meraid.svg"
              alt="meraid logo"
              style={{ width: '6rem', height: '2.5rem' }}
            />
          </div>
        </Modal>
      </Layout>
    </ElectionViewContext.Provider>
  );
};

export default HomeElectionViewPage;

const SideBar = () => {
  const { electionDetail } = useElectionViewContext();
  return (
    <>
      <Col md={8} sm={12}>
        <Space size={3} direction="vertical" className="w-full">
          <Card title="Organization">
            <Card.Meta
              avatar={
                <Avatar>{electionDetail?.data?.organization?.name[0]}</Avatar>
              }
              title={electionDetail?.data?.organization?.name}
            />
          </Card>
          <Card>
            <Descriptions column={1}>
              <Descriptions.Item label="Remaining Time">
                {electionDetail?.data?.status !== 'closed' ? (
                  <CountdownTimer
                    endDate={electionDetail?.data?.schedule?.to}
                  />
                ) : (
                  <p className="p-0 m-0" style={{ color: 'red' }}>
                    Closed
                  </p>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Closed At">
                <span className="font-mono">
                  {isoDateFormat(electionDetail?.data?.closedAt)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card
            className="shadow-md"
            style={{
              backgroundColor: '#F5D0FE',
            }}
          >
            <div>
              <Typography.Title level={5}>
                Voting Instructions 👋
              </Typography.Title>
              <p className="text-base">
                1. Select a candidate and press Vote button to vote for the
                candidate.
              </p>
              <p className="text-base">2. Sign using meraID</p>
            </div>
          </Card>
        </Space>
      </Col>
    </>
  );
};

const CandidateSelectionCard = ({ item }) => {
  const {
    selectedCandidate,
    electionDetail,
    notInVotersList,
    setSelectedCandidate,
    setVote,
    setVisibleData,
    setNullified,
  } = useElectionViewContext();

  const highlightCandidate = selectedCandidate?.user?._id === item?.user?._id;
  const disableOnClosedElections =
    electionDetail?.data?.status === 'closed' || electionDetail?.data?.voted;

  return (
    <>
      <div
        className={`candidate-box ${
          highlightCandidate && 'candidate-box-selected'
        } ${
          (disableOnClosedElections || notInVotersList) && 'pointer-events-none'
        }`}
        onClick={() => {
          setNullified(false);
          setSelectedCandidate(item);
          setVote({ candidate: item?._id });
          const newVisibleData = {
            orgName: electionDetail?.data?.organization?.name,
            electionName: electionDetail?.data?.title,
            symbol: item?.symbol,
            candidate: item?.user?.fullName || item?.user?.cnic,
          };
          setVisibleData(newVisibleData);
        }}
        style={{ marginInline: '1rem' }}
      >
        <div className="flex flex-col items-center jusitfy-center text-center">
          <div className="relative">
            <UserAvatarImage size={100} src={item?.user?.avatar} />
            {item?.symbol && (
              <div className="absolute flex items-center justify-center symbol-wrapper">
                <span>{getCandidateSymbol(item?.symbol)}</span>
              </div>
            )}
          </div>
          <Typography.Text className="my-1">
            {item?.user?.fullName || (
              <span className="font-mono">{formatCnic(item?.user?.cnic)}</span>
            )}
          </Typography.Text>
        </div>
      </div>
    </>
  );
};
