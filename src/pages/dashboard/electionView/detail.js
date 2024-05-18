import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Switch,
  message,
  DatePicker,
} from 'antd';
import React from 'react';
import { useElectionContext } from './context';
import { useForm } from 'antd/es/form/Form';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import request from '../../../utils/request';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const ElectionSettingsDetail = () => {
  const electionDetail = useElectionContext();

  const { orgId } = useParams();
  const [form] = useForm();
  const queryClient = useQueryClient();

  const electionUpdate = useMutation(
    async (payload) => {
      return request.put(
        `/organization/${orgId}/elections/${electionDetail._id}`,
        {
          ...payload,
          schedule: {
            from: payload.schedule[0],
            to: payload.schedule[1],
          },
        },
      );
    },
    {
      onError: (err) => message.error(err.message),
      onSuccess: () => {
        message.success('Elections updated successfully');
        queryClient.invalidateQueries(`org.elections:${electionDetail._id}`);
      },
    },
  );

  const disabledDate = (current) => {
    // Can not select days before today
    return current && current.startOf('day') < dayjs().startOf('day');
  };

  const disabledDateTime = (selectedDate) => {
    if (
      selectedDate &&
      selectedDate.startOf('day').isSame(dayjs().startOf('day'))
    ) {
      const currentHour = dayjs().hour();
      const currentMinute = dayjs().minute();

      return {
        disabledHours: () => range(0, 24).splice(0, currentHour),
        disabledMinutes: () => range(0, 60).splice(0, currentMinute),
      };
    }
  };

  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  return (
    <Card>
      <Form
        size="middle"
        layout="horizontal"
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        style={{ textAlign: 'start !important' }}
        onFinish={electionUpdate.mutate}
        initialValues={{
          title: electionDetail.title,
          description: electionDetail.description,
          schedule: electionDetail.schedule && [
            dayjs(electionDetail?.schedule?.from),
            dayjs(electionDetail?.schedule?.to),
          ],
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Title is required' }]}
        >
          <Input contentEditable={false} />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea contentEditable={false} rows={3} />
        </Form.Item>
        <Divider
          orientation="left"
          orientationMargin="0"
          style={{ marginBlock: '2rem' }}
        >
          SCHEDULE
        </Divider>
        <Form.Item
          label="Start & End"
          name="schedule"
          rules={[
            { required: true, message: 'Start & End dates are required' },
          ]}
        >
          <DatePicker.RangePicker
            showTime={{ format: 'HH:mm' }}
            disabledDate={disabledDate}
            disabledTime={disabledDateTime}
          />
        </Form.Item>
        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="mt-5"
            loading={electionUpdate.isLoading}
            disabled={!form.isFieldsTouched}
          >
            Save
          </Button>
        </div>
      </Form>
    </Card>
  );
};
export default ElectionSettingsDetail;
