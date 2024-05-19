import { Spin, Typography, message } from 'antd';
import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import request from '../../../utils/request';
import { useElectionViewContext } from '../electionView.page';

const SignVote = ({ candidate, visibleData }) => {
  const token = window.localStorage.getItem('e-voting.auth.token');
  const queryClient = useQueryClient();
  const { electionId } = useParams();
  const location = useLocation();

  const navigate = useNavigate();
  const { electionDetail, qrCode, setQrCode, nullified } =
    useElectionViewContext();

  const [isCollecting, setIsCollecting] = React.useState(false);
  const [qrCodeResponse, setQrCodeResponse] = React.useState({
    statusText: '',
    textColor: 'black',
    isSuccess: false,
  });

  const STATUSES = {
    STATUS: {
      PENDING: 'pending',
      COMPLETE: 'complete',
      FAILED: 'failed',
    },
    HINT_CODE: {
      OUTSTANDING_TRANSACTION: 'outstandingTransaction',
      USER_SIGN: 'userSign',
      USER_CANCEL: 'userCancel',
      NOT_FOUND: 'notFound',
    },
  };

  const signRequest = useQuery(
    'signRequest',
    async () => {
      return await request.post(
        `${process.env.REACT_APP_API_ENDPOINT}/auth/sign`,
        {
          orgName: visibleData?.orgName,
          electionName: visibleData?.electionName,
          candidate: visibleData?.candidate,
          symbol: visibleData?.symbol,
        },
      );
    },
    {
      onSuccess: () => {
        setIsCollecting(true);
      },
    },
  );

  const collectRequest = useQuery(
    'collectRequest',
    async () => {
      return axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/auth/sign-collect`,
        {
          requestId: signRequest.data?.requestId,
          electionId: electionId,
          candidate: nullified ? 'null' : candidate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    {
      onSuccess: ({ data }) => {
        setQrCode(data.qrCode);

        if (
          data.status === STATUSES.STATUS.PENDING &&
          data.hintCode === STATUSES.HINT_CODE.OUTSTANDING_TRANSACTION
        ) {
          setQrCodeResponse((prev) => ({
            ...prev,
            color: 'black',
            statusText:
              'Open meraID application on your mobile device to sign.',
          }));
        }

        if (
          data.status === STATUSES.STATUS.PENDING &&
          data.hintCode === STATUSES.HINT_CODE.USER_SIGN
        ) {
          setQrCode(null);
          setQrCodeResponse((prev) => ({
            ...prev,
            statusText: 'user is signing with meraID.',
            color: 'gold',
          }));
        }

        if (
          data.status === STATUSES.STATUS.FAILED &&
          data.hintCode === STATUSES.HINT_CODE.USER_CANCEL
        ) {
          setIsCollecting(false);
          setQrCode(null);
          setQrCodeResponse((prev) => ({
            ...prev,
            statusText: 'User has cancelled the signature request.',
            color: 'red',
          }));
        }

        if (data.status === 'error') {
          message.error(data?.message);
          setIsCollecting(false);
          setQrCode(null);
          setQrCodeResponse({
            statusText: data?.message,
            color: 'red',
            isSuccess: false,
          });

          setTimeout(() => {
            navigate({ hash: '' });
          }, 3000);
        }

        if (data.hintCode === 'complete' && data.status === 'success') {
          message.success('Successfully voted!');
          setIsCollecting(false);
          setQrCode(null);
          setQrCodeResponse({
            statusText: 'Thank you for signing with meraID.',
            color: 'green',
            isSuccess: true,
          });
          electionDetail.refetch();
        }
      },
      onError: (error) => {
        setIsCollecting(false);
        setQrCode(null);
        setQrCodeResponse((prev) => ({
          ...prev,
          statusText: 'Something went wrong! Please try again.',
          color: 'red',
        }));
      },
      enabled: isCollecting && location.hash === '#vote',
      refetchInterval: 3000,
    },
  );

  React.useEffect(() => {
    queryClient.invalidateQueries(['signRequest']);
    queryClient.invalidateQueries(['collectRequest']);
  }, [queryClient, location.hash === '']);

  if (signRequest.isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ marginBlock: '2rem' }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div style={{ marginTop: '2rem' }}>
          <div className="flex flex-col items-center justify-center text-center">
            {!qrCodeResponse.isSuccess && qrCode !== null && (
              <QRCodeCanvas value={qrCode} size={200} level="H" />
            )}
            <Typography.Paragraph
              style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                color: qrCodeResponse.color,
              }}
            >
              {qrCodeResponse.statusText}
            </Typography.Paragraph>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignVote;
