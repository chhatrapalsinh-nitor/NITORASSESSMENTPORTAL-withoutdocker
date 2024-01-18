import React, { useState, useEffect } from "react";
import { Input, Layout, Button, message, Divider, Table, Modal, Collapse, Form, Space, Tooltip, Tag, Select,  Row, Col, List, Typography, Skeleton } from 'antd';
import { CreateTestForm, languageOptions } from "../Utils/constants";
import { EditFilled, CloseOutlined } from '@ant-design/icons'
import { triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import { useFetch } from "../Utils/Hooks/useFetchAPI";
const { Panel } = Collapse;

const AddTest = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(props.open);
    const [isEditModalOpen, setIsEditModalOpen] = useState(props.isEdit);
    const [record, setRecord] = useState(props.record);
    const [dataList, setDataList] = useState(props.dataList);
    const [componentDisabled, setComponentDisabled] = useState(true);
    const [form] = Form.useForm();
    const [difficultyLevel, setDifficultyLevel] = useState("1");
    const [activeTab, setActiveTab] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [showEditSection, setShowEditSection] = useState(false);

    const columns3 = [
        {
            title: 'Test Name',
            dataIndex: 'name',
            key: 'name',
            width: '400px',
            // colSpan: 16,
            render: (text, record) => (
                <>
                    <a onClick={() => { showDetailModal(record) }}>{text}</a>
                </>
            ),
        },
        {
            title: 'Score Weightage',
            dataIndex: 'weightage',
            key: 'weightage',
            width: '400px',
            // colSpan: 16,
            render: (text, record) => (
                <>
                    <a onClick={() => { showDetailModal(record) }}>{text}</a>
                </>
            ),
        },
        {
            title: 'Action',
            render: (_, record) => (
                <>
                    <Space>
                        <Tooltip placement="topLeft" title="Remove From List">
                            <CloseOutlined onClick={() => { removeDataList(record)}}/>
                        </Tooltip>
                    </Space>
                    
                </>
            )
        }
    
    ]


    const calculateWeightage = (question) => {
        const weights = {
            easy_program_count: 5,
            medium_program_count: 10,
            hard_program_count: 15,
            mcq_count: 5
        };
    
        let score = 0;
    
        for (const key in weights) {
            const count = parseInt(question[key]);
            if (count !== 0) {
                score += weights[key] * count;
            }
        }
        return score
    };


    const onEditFinish = (values) => {
        delete values["name"];
        values["language"] = selectedLanguage ? selectedLanguage : activeTab
        values["mcq_difficulty"] = difficultyLevel
        let dList = {}
        let weightage = calculateWeightage(values);
       
        dataList.map(item => {
            let index = item.question_details.findIndex(obj => obj.language === activeTab);
            item.question_details[index] = values
            item.weightage = weightage
            setSelectedLanguage("");    
            dList = item


        });
        setDataList([dList]);
        
    }

    const onFinish = (values) => {
        // const values = form.validateFields();
        let name = values["name"];
        delete values["name"];
        values["mcq_difficulty"] = difficultyLevel
        let weightage = calculateWeightage(values);
        let form_data = {
            "name" : name,
            "weightage": weightage,
            "question_details" : [values]
        }   
        
        if(dataList.length == 0){
            setDataList(oldArray => [...oldArray, form_data]);
            setComponentDisabled(false);
        }
        else{
            let filterArray = dataList.filter(item => item.name == name);
            filterArray.map(item => {
                form_data.question_details = [item.question_details[0], values];
                setDataList([form_data]);
            })
        }
        setShowEditSection(false);
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const selectAfter = (rec) => {
        return (
            <Select defaultValue={rec?rec.mcq_difficulty:"1"} onChange={handleChange}>
            <Option value="1">Easy</Option>
            <Option value="2">Medium</Option>
            <Option value="3">Hard</Option>
            </Select>
        )
        
    }
        

    const handleChange = (value) => {
        isNaN(value) ?setSelectedLanguage(value):setDifficultyLevel(value);
    };

    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const removeDataList = (record) => {
        let filterArray = dataList.filter(item => item.name !== record.name);
        setDataList(filterArray);
    }

    const createTest = () => {
        if (record){
            dataList[0]["id"] = record.id
        }
        triggerFetchData(
                'create_update_test/', dataList[0]
            ).then(
                (data) => {
                    console.log("RESULT",data);
                    message.success('Test created');
                    props.func();
                }
            ).catch(reason => message.error(reason));
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        
        form.resetFields();
    }


    const handleCancel = () => {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
    };

    const onCollapseChange = (key) => {
        setActiveTab(key);
      };

    return (
        <>
        {!isEditModalOpen?
        <Modal title="Add New Test"  open={isModalOpen} onOk={createTest} onCancel={handleCancel} width={900} okText="Submit">
            <Row>
                
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
                        maxWidth: 'none',
                    }}
                    layout="inline"
                    initialValues={record}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >

                    {CreateTestForm.map((item, index) => (
                        <>
                            <Col span={12}>
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

                                {item.dataIndex == "language" ?
                                    <Select
                                    showSearch
                                    placeholder="Select a person"
                                    optionFilterProp="children"
                                    // onChange={onChange}
                                    // onSearch={onSearch}
                                    filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={languageOptions}
                                />
                                : item.dataIndex == "mcq_count"? <Input  addonAfter={selectAfter()} />
                                : item.dataIndex == "name" ? <Input disabled={!componentDisabled}/>
                                : <Input />}



                                </Form.Item>
                            
                        <br></br>
                        </Col>
                            
                        </>
                    ))}
                    <Button type="primary" ghost onClick={form.submit}>Add To List</Button>
                    <Divider></Divider>
                    <Table columns={columns3} dataSource={dataList?dataList:question_details} onChange={onChange} />
                    
                </Form>
            </Row>
        </Modal>

        :
        //   TODO: Implementation for Edit Test 
        <Modal title="Edit Test"  open={isEditModalOpen} onOk={createTest} onCancel={handleCancel} width={900} okText="Submit">
            <>
            {record?.question_details?.map((rec, index) => (
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
                        maxWidth: 'none',
                    }}
                    layout="inline"
                    initialValues={{name: record.name, ...rec}}
                    onFinish={onEditFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                        <Col span={24}>
                            <Collapse accordion key={`collapse-index-${index}`} onChange={onCollapseChange} >
                                <Panel header={rec.language} key={rec.language}>
                                    <Row>
                                        {CreateTestForm.map((item, index) => (
                                            <>
                                                <Col span={12}>
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
                                                    <Space.Compact>
                                    
                                                    {item.dataIndex == "language" ?
                                                    <Select
                                                        showSearch
                                                        placeholder="Select a person"
                                                        optionFilterProp="children"
                                                        defaultValue = {rec[item.dataIndex]}
                                                        filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                        }
                                                        options={languageOptions}
                                                        onChange={handleChange}
                                                    />
                                                    
                                                    : item.dataIndex == "mcq_count"? <Input addonAfter={selectAfter(rec)} defaultValue = {rec[item.dataIndex]}/>
                                                    : item.dataIndex == "name" ? <Input defaultValue = {record[item.dataIndex]} disabled={true}/>
                                                    : <Input defaultValue = {rec[item.dataIndex]}/>
                                                    }
                                                    </Space.Compact>

                                                </Form.Item>
                                                
                                                <br></br>
                                                </Col>
                                            </>
                                        ))}
                                        <Button type="primary" ghost onClick={form.submit}>Update</Button>
                                    </Row>
                                </Panel>
                            </Collapse>
                        </Col>
                </Form>               
            ))}
             <br></br> 
            </>
        </Modal>
    }
        
        </>
    )
}

export default AddTest;
