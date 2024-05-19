import { Avatar } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

export const UserAvatarImage = (props) => {
  const size = props.size ?? 'default';

  const { session } = useSelector((store) => store.auth);
  const userImage = session?.profile?.avatar;
  const fullName = session?.profile?.fullName;
  const cnic = session?.profile?.cnic;
  const src = props.src ?? userImage;

  return (
    <>
      <Avatar
        src={`https://meraid-evoting.s3.amazonaws.com/${src}`}
        alt={fullName || cnic}
        size={size}
      />
    </>
  );
};
