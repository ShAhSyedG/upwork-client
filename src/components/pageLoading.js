import { PageLoading } from '@ant-design/pro-components';
import { Typography } from 'antd';

const PageLoader = ({ heading }) => {
  return (
    <div className="page-loader">
      <PageLoading />

      {heading && (
        <Typography.Title level={5} style={{ marginTop: '1em' }}>
          Checking Session...
        </Typography.Title>
      )}
    </div>
  );
};

export default PageLoader;
