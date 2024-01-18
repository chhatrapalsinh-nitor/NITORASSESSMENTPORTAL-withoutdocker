import React, { useState, useEffect } from "react";
import { Table, Button, Input, Layout, Modal, Form } from 'antd';

const data = [];
const DynamicTable = ({ columns }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        window.EventBus.publish('dynamicTableData', tableData)
    }, [tableData])
    // const columns = [
    //     {
    //         title: 'Language Name',
    //         dataIndex: 'language',
    //         key: 'language',
    //         sorter: (a, b) => a.language - b.language,
    //     },
    //     {
    //         title: 'MCQ Count',
    //         dataIndex: 'mcq_count',
    //         key: 'mcq_count',
    //     },

    //     {
    //         title: 'Easy Programs',
    //         dataIndex: 'easy_program_count',
    //         key: 'easy_program_count',
    //     },

    //     {
    //         title: 'Medium Program',
    //         dataIndex: 'medium_program_count',
    //         key: 'medium_program_count',
    //     },

    //     // {
    //     //     title: 'Hard Program',
    //     //     dataIndex: 'hard_program_count',

    //     // },

    // ];

    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = (values) => {
        setIsModalOpen(false);
        console.log(values)

    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onFinish = async (values) => {
        console.log('Success:', values);
        await setTableData(oldArray => [...oldArray, values])
        form.resetFields()
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    return (<>
        <Layout.Content style={{ height: '100vh', padding: '1rem' }}>
            <Table columns={columns} dataSource={tableData} onChange={onChange} />
            <Button type="primary" onClick={showModal}>
                Add Question
            </Button>
            <Modal title="Add question" open={isModalOpen} onOk={form.submit} onCancel={handleCancel}>

                <Form
                    form={form}
                    name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >

                    {columns.map((item, index) => (
                        <Form.Item
                            key={`form-item-${index}`}
                            label={item.title}
                            name={item.dataIndex}
                            rules={[
                                {
                                    required: true,
                                    message: `Please input your ${item.title}`,
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        </Layout.Content>
    </>)
}

export default DynamicTable;