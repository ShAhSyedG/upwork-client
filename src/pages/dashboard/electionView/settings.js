import { Col, Row } from 'antd';
import { Route, Routes } from 'react-router-dom';
import ElectionSettingsDetail from './detail';

const ElectionSettings = () => {
  return (
    <Row gutter={20}>
      <Col span={18} offset={3}>
        <Routes>
          <Route path="/" index element={<ElectionSettingsDetail />} />
        </Routes>
      </Col>
    </Row>
  );
};

export default ElectionSettings;
