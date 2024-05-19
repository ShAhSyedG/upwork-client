import React from 'react';
import { useNavigate } from 'react-router-dom';

export const useHandleHashRoutes = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      navigate(currentPath, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);
};
