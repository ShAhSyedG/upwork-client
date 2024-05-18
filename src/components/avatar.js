import { Avatar as AntAvatar } from 'antd';

const Avatar = (props) => {
  let src = props.src;
  if (src == 'default.jpg') src = '/images/avatar.png';
  return <AntAvatar {...props} src={src} />;
};

export default Avatar;
