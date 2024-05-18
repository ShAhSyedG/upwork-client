import axios from 'axios';

export const OrganizationElectionsFetch = async () => {
  const { data } = await axios.get(
    'http://localhost:4001/organization/64916c9924f1709be1f1d9ff/elections',
  );
  return data.data;
};

export const OrganizationElectionDelete = async ({ _id }) => {
  const { data: response } = await axios.delete(
    `http://localhost:4001/organization/64916c9924f1709be1f1d9ff/elections/${_id}`,
  );
  if (response.status !== 'ok') throw response;
  return response.data;
};

export const OrganizationElectionCreate = async (payload) => {
  const { data: response } = await axios.post(
    `http://localhost:4001/organization/64916c9924f1709be1f1d9ff/elections`,
    payload,
  );
  if (response.status !== 'ok') throw response;
  return response.data;
};

export const OrganizationUsersFetchAll = async () => {
  const { data: response } = await axios.get(
    'http://localhost:4001/organization/64916c9924f1709be1f1d9ff/users',
  );
  if (response.status !== 'ok') throw response;
  return response.data;
};

export const OrganizationUsersAdd = async (payload) => {
  const { data: response } = await axios.post(
    `http://localhost:4001/organization/64916c9924f1709be1f1d9ff/users`,
    payload,
  );
  if (response.status !== 'ok') throw response;
  return response.data;
};

export const OrganizationUsersDelete = async ({ _id }) => {
  const { data: response } = await axios.delete(
    `http://localhost:4001/organization/64916c9924f1709be1f1d9ff/users/${_id}`,
  );
  if (response.status !== 'ok') throw response;
  return response.data;
};
