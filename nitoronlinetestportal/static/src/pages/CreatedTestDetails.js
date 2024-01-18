import React, { useState, useEffect } from "react";
import { useFetch } from "../Utils/Hooks/useFetchAPI";
import { Table, Layout, Modal, Collapse } from 'antd';
import PropTypes from 'prop-types';

const { Panel } = Collapse;

const CreatedTestDetails = (props) => {
    const [rowRecord, setRowRecord] = useState(false);
    const { isLoading, serverError, apiData } = useFetch(
        "get_test_list",
    );
    // trigger on component mount
    useEffect(() => {
        props.setSelectedKey('created-test-details');
    }, []);

    const columns = [
        {
            title: 'Test Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <p>{text}</p>,
        },
        {
            title: 'Total Questions',
            dataIndex: 'total_questions',
            key: 'total_questions',
        },
        {
            title: 'Question Details',
            key: 'question_details',
            render: (_, record) => (
                <>
                    <a onClick={() => { showDetailModal(record) }}>Click to View</a>
                </>
            ),
        },
    ];

    const showDetailModal = (record) => {
        console.log("SHOW DETAIL", { record })

        record.question_details.map(item => {
            console.log("KEY VALUES OF RECORD", Object.keys(item),
                item.easy_program_count,
                item.hard_program_count,
                item.mcq_count,
                item.medium_program_count
            );
        })

        setRowRecord(record)

    }

    const handleOk = () => {
        setRowRecord(null);
    };

    const handleCancel = () => {
        setRowRecord(null);
    };

    return (
        <>
            <Layout.Content style={{ padding: '1rem', height: '100vh' }}>
                <Table bordered loading={isLoading} columns={columns} dataSource={apiData ? apiData.data : []} />
            </Layout.Content>
            {rowRecord && (
                <Modal title={rowRecord.name} open={rowRecord} onOk={handleOk} onCancel={handleCancel}>
                    {rowRecord?.question_details?.map((item, index) => (
                        <>
                            <Collapse  key={`collapse-index-${index}`} defaultActiveKey={['1']} >
                                <Panel header={item.language} key={`panel-index-${index}`}>
                                    {<ul>
                                        <li>MCQ Count: {item.mcq_count}</li>
                                       <li>Easy Program:  {item.easy_program_count}</li>
                                       <li>Medium Count: {item.medium_program_count}</li>
                                       <li>Hard Program: {item.hard_program_count}</li>
                                    </ul>
                                      }
                                </Panel>
                            </Collapse>
                        </>
                        // <Table loading={isLoading} columns={Object.keys(item)} dataSource={apiData} />
                    ))}
                </Modal>
            )}
        </>
    )
}

CreatedTestDetails.propTypes = {
    setSelectedKey: PropTypes.func,
};

CreatedTestDetails.defaultProps = {
    setSelectedKey: (key) => {console.log(key);}
};

export default CreatedTestDetails;