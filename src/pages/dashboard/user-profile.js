import { Button, Card, Modal, Typography, Upload, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import request from '../../utils/request';
import { UserAvatarImage } from '../../components/user-data';
import { authSetSession } from '../../store/reducers/auth';

const UserProfile = () => {
  const { session } = useSelector((store) => store.auth);
  const { orgId } = useParams();
  const dispatch = useDispatch();

  const [file, setFile] = React.useState(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewTitle, setPreviewTitle] = React.useState('');

  const fullName = session?.profile?.fullName;
  const cnic = session?.profile?.cnic;
  const userId = session?.profile?._id;

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
    });

  const onCancel = () => setPreviewOpen(false);

  const onImageSelect = (file) => {
    setFile(file);
    return false;
  };

  const onPreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    );
  };

  const uploadImage = useMutation(
    'user-image-upload',
    async () => {
      const payload = new FormData();
      payload.append('file', file);
      return await request.put(
        `organization/${orgId}/users/${userId}/user-image-upload`,
        payload,
      );
    },
    {
      onSuccess: (response) => {
        message.success('Successfully uploaded image');
        dispatch(
          authSetSession({
            profile: { ...session.profile, avatar: response.data },
            organization: session.organization,
          }),
        );
      },
      onError: (error) => {
        message.error(error.message);
      },
    },
  );

  return (
    <>
      <div style={{ padding: '1rem' }}>
        <Card>
          <div className="flex items-center">
            <UserAvatarImage />
            <div className="flex flex-col" style={{ marginLeft: '.5rem' }}>
              <Typography.Text>{fullName}</Typography.Text>
              <Typography.Text style={{ color: '#57534E' }}>
                {cnic}
              </Typography.Text>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Upload
              maxCount={1}
              accept=".png,.jpg,.jpeg"
              listType="picture-circle"
              onPreview={onPreview}
              beforeUpload={onImageSelect}
            >
              <p className="text-xs m-0 p-0" style={{ color: '#57534E' }}>
                Upload Image
              </p>
            </Upload>
          </div>
          <div className="text-end">
            <Button
              style={{ marginTop: '2rem' }}
              onClick={uploadImage.mutate}
              disabled={file === null}
              loading={uploadImage.isLoading}
            >
              Save changes
            </Button>
          </div>
        </Card>
      </div>
      <Modal open={previewOpen} footer={null} onCancel={onCancel}>
        <Typography.Title level={5} style={{ width: '75%' }}>
          {previewTitle}
        </Typography.Title>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default UserProfile;
