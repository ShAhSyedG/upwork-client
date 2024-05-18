import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import request from '../utils/request';
import { authSetSession } from '../store/reducers/auth';
import { message } from 'antd';
import PageLoader from '../components/pageLoading';
import LoginPage from './auth/login.page';
import _ from 'lodash';

const RootHanlder = () => {
  const { session } = useSelector((store) => store.auth);
  const { orgId } = useParams();
  const dispatch = useDispatch();

  const { isLoading } = useQuery(
    'logged',
    async () => {
      const { data } = await request.get('/auth/init');
      dispatch(authSetSession(data));
      return data;
    },
    {
      enabled: !session,
      onError: () => {
        message.error('Login to Continue');
      },
    },
  );

  if (isLoading) return <PageLoader heading="Checking Session..." />;
  if (session == null) return <LoginPage />;
  if (orgId && !_.find(session.organizations, { _id: orgId })) {
    message.error('Access Denied');
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
export default RootHanlder;
