import { PageHeader } from '@ant-design/pro-components';
import { Button, Card, Col, Form, Input, Row, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';

const OrganizationElectionCreatePage = () => {
  const [step, setCurrentStep] = React.useState(0);
  const navigate = useNavigate();

  const { orgId } = useParams();

  const electionCreateMutation = useMutation(
    async (payload) => {
      const { data } = await request.post(
        `/organization/${orgId}/elections`,
        payload,
      );
      return data;
    },
    {
      onSuccess: (election, payload) => {
        message.success(`Election '${payload.title}' Created`);
        navigate(`../elections/${election._id}/settings`);
      },
      onError: (error) => message.error(error.message),
    },
  );

  const onFinish = (values) => {
    electionCreateMutation.mutate(values);
  };

  return (
    <Content>
      <PageHeader onBack={() => navigate(-1)} title="Create new Election" />
      <Card
        style={{
          margin: '1rem',
          background: '#fff',
        }}
      >
        <Row gutter={[40]} style={{ justifyContent: 'center' }}>
          {/* <Col span={5}>
            <Steps
              style={{ borderRight: "1px solid #f5f5f5" }}
              direction="vertical"
              current={step}
              onChange={setCurrentStep}
              items={[
                { title: "Detail" },
                {
                  title: "Candidates",
                },
                {
                  title: "Voters",
                },
              ]}
            />
          </Col> */}

          <Col span={12}>
            <Form
              onFinish={onFinish}
              name="basic"
              layout="vertical"
              initialValues={{ remember: true }}
              autoComplete="off"
            >
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input.TextArea />
              </Form.Item>

              <div className="flex items-center jusitify-between">
                <div />
                <Button
                  type="primary"
                  loading={electionCreateMutation.isLoading}
                  htmlType="submit"
                >
                  Next
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </Content>
  );
};

export default OrganizationElectionCreatePage;
