import React, { useState, useEffect } from "react";
import { Input, Layout, Button, message, Divider, Table, Modal, Collapse, Form, Space, Tooltip, Tag, Select,  Row, Col } from 'antd';
import { triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import { useFetch } from "../Utils/Hooks/useFetchAPI";
import { EditFilled, CloseOutlined } from '@ant-design/icons'
import AddTest from "../components/AddTest";
import PropTypes from 'prop-types';
import '../styles/create-test.css';
/**
 * 
 *  {
      "name" : "WellSky Backend Test",
      "total_questions" : 25,
      "question_details": [
          {
            "python": {
              "mcq_count": 5,
              "easy_program_count": 1,
              "medium_program_count": 2,
              "hard_program_count": 3
            }
          },
          {
            "javascript": {
              "mcq_count": 5,
              "easy_program_count": 1,
              "medium_program_count": 2,
              "hard_program_count": 1
            }
          },
          {
            "graphql": {
              "mcq_count": 5,
              "easy_program_count": 0,
              "medium_program_count": 0,
              "hard_program_count": 0
            }
          }
      ]
    }
 */
const { Panel } = Collapse;
const CreateTest = (props) => {
    let filter_test_data = []
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rowRecord, setRowRecord] = useState(false);
    const [record, setRecord] = useState(null);
    const [dataList, setDataList] = useState([]);
    const [componentDisabled, setComponentDisabled] = useState(true);
    const [form] = Form.useForm();
    const [difficultyLevel, setDifficultyLevel] = useState("1");

    const { isLoading, serverError, apiData, fetchData } = useFetch(
        "get_test_list",
    )

    // trigger on component mount
    useEffect(() => {
        props.setSelectedKey('create-test');
    }, []);

    let filter_test = () => {
        if (apiData){
            apiData.data.map((data, index) => {
                if (!filter_test_data.some(item => data.name === item.value)) {
                    filter_test_data.push({ value: data.name, text: data.name });
                }
              });
        }
        return filter_test_data
    }

    const handleChange = (value) => {
        setDifficultyLevel(value);
    };

    const selectAfter = (
        <Select defaultValue="1" onChange={handleChange}>
          <Option value="1">Easy</Option>
          <Option value="2">Medium</Option>
          <Option value="3">Hard</Option>
        </Select>
    );


    const columns2 = [
        {
            title: 'Test Name',
            dataIndex: 'name',
            key: 'name',
            filters: filter_test(),
            onFilter: (value, record) => record.name.indexOf(value) === 0,
            filterMultiple: true,
            // // render: (text) => <p>{text}</p>,
            render: (text, record) => (
                <>
                    <a onClick={() => { showDetailModal(record) }}>{text}</a>
                </>
            ),
        },
        {
            title: 'Total Questions',
            dataIndex: 'total_questions',
            key: 'total_questions',
        },
        {
            title: 'Type',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (_, record) => (
                <>
                {
                    record.is_active == true ?
                    <Tag color="blue">Active</Tag>
                    :
                    <Tag color="pink">Deactivate</Tag>
                }              
                </>
            )
        },
        {
            title: 'Action',
            render: (_, record) => (
                <>
                    <Space>
                        <Tooltip placement="topLeft" title="Edit Test">
                            <EditFilled onClick={() => { showEditlModal(record)}} />
                        </Tooltip>
                        {
                            <Tooltip placement="topLeft" title={record.is_active ? "Deactivate" : "Activate"} >
                                <label className="toggle">
                                    <Input className="toggle-checkbox" type="checkbox" onClick={() => { showDeactivatelModal(record)}} checked={record.is_active} />
                                    <div className="toggle-switch"></div>
                                </label>
                            </Tooltip>
                        }  
                    </Space>
                    
                </>
            )
        }

    ];

    const showEditlModal= (record) => {
        let form_val = {
            ...record,
            ...record.question_details,
        }
        setRecord(form_val);
        setIsEditModalOpen(true);
        setDataList(oldArray => [...oldArray, {name: record.name, question_details: record.question_details}]);
    }

    const showDeactivatelModal = (record) => {
        // console.log("SHOW DETAIL", { record })
        setIsDeleteModalOpen(record);
        setRecord(record);
    }

    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = (values) => {
        setIsModalOpen(false);
        setRowRecord(null);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setRowRecord(null);
        setIsDeleteModalOpen(false);
        setIsEditModalOpen(false);
    };

    const createTest = () => {
        if (record){
            dataList[0]["id"] = record.id
        }
        triggerFetchData(
                'create_update_test/', dataList[0]
            ).then(
                (data) => {
                    // console.log("RESULT",data);
                    message.success('Test created');
                    fetchData();
                }
            ).catch(reason => message.error(reason));
        form.resetFields();
        setIsModalOpen(false);
    }

    const removeDataList = (record) => {
        let filterArray = dataList.filter(item => item.name !== record.name);
        setDataList(filterArray);
    }

    const onFinish = async () => {
        const values = await form.validateFields();
        let name = values["name"];
        delete values["name"];
        values["mcq_difficulty"] = difficultyLevel
        let form_data = {
            "name" : name,
            "question_details" : [values]
        }
        
        if(dataList.length == 0){
            setDataList(oldArray => [...oldArray, form_data]);
            setComponentDisabled(false);
        }
        else{
            let filterArray = dataList.filter(item => item.name == name);
            filterArray.map(item => {
                form_data.question_details = [item.question_details, values];
                if (record){
                    let index = item.question_details.findIndex(obj => obj.language === values.language);
                    item.question_details.splice(index, 1);
                    form_data.question_details = [item.question_details[0], values];  
                    setDataList([form_data]);
                }
                else{
                    form_data.question_details = [item.question_details, values];
                    setDataList([form_data]);
                }
            })
            
        }
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const showDetailModal = (record) => {
        setRowRecord(record);
    }

    const handleDeactivate = () => {
        triggerFetchData(
            `deactivate_test/?testId=${record.id}`,[],'PATCH'
        ).then(
            (data) => {
                // console.log("RESULT",data)
                message.success(data.message);
                fetchData();
            }
        ).catch(reason => message.error(reason));
        
        setIsDeleteModalOpen(false);
    }

    
    return (<>
        <Layout.Content style={{ height: '100vh', padding: '1rem' }}>
            <Button type="primary" onClick={showModal}>
                Add New Test
            </Button>

            {/* Add Test */}
            {isModalOpen || isEditModalOpen ? <AddTest open={isModalOpen || isEditModalOpen} isEdit={isEditModalOpen} func={fetchData} record={record} dataList={dataList}/> : null}


        
            {/* table */}
            <Table loading={isLoading} columns={columns2} dataSource={apiData?apiData.data:[]} onChange={onChange} />
            <Modal title={isDeleteModalOpen.name} open={isDeleteModalOpen} onOk={() => handleDeactivate()} onCancel={handleCancel} okText="Yes">
                <p>Are you sure you want to {record&&record.is_active ? `deactivate` : `activate`}  this test?</p>

            </Modal>
        </Layout.Content>

        {rowRecord && (
                <Modal title={rowRecord.name} open={rowRecord} onOk={handleOk} onCancel={handleCancel}>
                    {rowRecord?.question_details?.map((item, index) => (
                        <>
                            <Collapse  key={`collapse-index-${index}`} defaultActiveKey={['1']} >
                                <Panel header={item.language}>
                                    {<ul>
                                        <li>   MCQ Count: {item.mcq_count}</li>
                                       <li> Easy Program:  {item.easy_program_count}</li>
                                       <li>Medium Count: {item.medium_program_count}</li> 
                                       <li> Hard Program: {item.hard_program_count}</li> 
                                    </ul>
                                      }
                                </Panel>
                            </Collapse>
                        </>
                    ))}
                </Modal>
            )}

        
        
    </>)
}

CreateTest.propTypes = {
    setSelectedKey: PropTypes.func,
};

CreateTest.defaultProps = {
    setSelectedKey: (key) => {console.log(key);}
};

export default CreateTest;
