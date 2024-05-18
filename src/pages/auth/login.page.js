import React, { useEffect } from 'react';
import { Layout, Space, Typography } from 'antd';

const LoginPage = () => {
  useEffect(() => {
    const container = document.querySelector('.meraid-auth-container');
    if (!container.shadowRoot) {
      window.meraIDAuth({
        container: '.meraid-auth-container',
        buttonStyle: 'border-radius: 12px;width: max-content;height: 40px',
        authApi: {
          method: 'POST',
          url: `${process.env.REACT_APP_API_ENDPOINT}/auth/login`,
        },
        collectApi: {
          method: 'POST',
          url: `${process.env.REACT_APP_API_ENDPOINT}/auth/collect`,
        },
        onSuccess: async ({ jwtToken }) => {
          localStorage.setItem('e-voting.auth.token', jwtToken);
          window.location.href = '/';
        },
      });
    }
  }, []);

  return (
    <Layout className="auth-layout">
      <Space
        direction="vertical"
        size={40}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ width: '100%' }}>
          <img src="logo.png" style={{ width: '18em', height: '18em' }} />
        </div>

        <img src="/images/login_bg.svg" style={{ width: '100%' }} />
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Secure Login
          </Typography.Title>
          <Typography.Text>
            Ensuring trustworthy votes through secure login.
          </Typography.Text>
        </div>
        <div className="meraid-auth-container" />
      </Space>
    </Layout>
  );
};

export default LoginPage;
