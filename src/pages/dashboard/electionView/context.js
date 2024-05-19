import React from 'react';

export const ElectionContext = React.createContext(undefined);

export const useElectionContext = () => {
  const ctx = React.useContext(ElectionContext);
  if (ctx === undefined) {
    throw new Error(
      'useElectionContext should be used inside ElectionContext.Provider',
    );
  }
  return ctx;
};
