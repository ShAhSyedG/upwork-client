import { Button, Card, DatePicker, Divider, Form, Input, message } from 'antd';
import { useContext, useRef } from 'react';
import ElectionContext from './context';
import axios from 'axios';

const ElectionSettingsSecrecy = () => {
  const election = useContext(ElectionContext);
  const form = useRef();

  const onSubmit = async (payload) => {
    try {
      const { data: response } = await axios.put('/', payload);
      message.success('Election saved');
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <Card>
      <Form
        ref={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        style={{ textAlign: 'start !important' }}
        onFinish={onSubmit}
      >
        <Form.Item label="Title" name="title" initialValue={election?.title}>
          <Input contentEditable={false} />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          initialValue={election?.description}
        >
          <Input.TextArea contentEditable={false} rows={3} />
        </Form.Item>

        <Divider orientation="right" orientationMargin="20px">
          Result
        </Divider>

        <Form.Item label="How can Vote" name="schedule.startAt">
          <DatePicker
            showTime={true}
            showHour={true}
            showNow={true}
            showMinute={true}
            showSecond={false}
          />
        </Form.Item>
        <Form.Item label="End At" name="schedule.endAt">
          <DatePicker
            showTime={true}
            showHour={true}
            showNow={true}
            showMinute={true}
            showSecond={false}
          />
        </Form.Item>
        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Card>
  );
};
export default ElectionSettingsSecrecy;
