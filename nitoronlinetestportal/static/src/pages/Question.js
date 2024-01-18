import React, { useState, useEffect } from "react";
import { Divider, Layout, Button, Space, Upload, Table, Collapse, Tag, Modal, message, Form, Input, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useFetch, triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import { readExcel, generateExcelFromJson } from "../Utils/utilFunctions";
import { templateJSONData, optionList, caseList } from "../Utils/constants";
import { EditFilled, DeleteFilled } from '@ant-design/icons'
import PropTypes from 'prop-types';

const { Panel } = Collapse;


const Question = (props) => {
    let filter_language_data = []
    const [record, setRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [form3] = Form.useForm();
    const [questionDetail, setquestionDetail] = useState(null);
    const [testDetails, setTestDetails] = useState(null);
    const [fetchUrl, setFetchUrl] = useState("questions")

    const { isLoading, serverError, apiData, fetchData } = useFetch(
        fetchUrl
    )

    // trigger on component mount
    useEffect(() => {
        props.setSelectedKey('questions');
    }, []);

    let filter_language = () => {
        if (apiData){
            JSON.parse(apiData?.data[0].all_languages)?.map((name, index) => {
                if (!filter_language_data.some(item => name.language === item.value)) {
                    filter_language_data.push({ value: name.language, text: name.language });
                }
              });
        }
        return filter_language_data
    }
    
    const columns = [
        {
            title: 'Language Name',
            dataIndex: 'language',
            key: 'language',
            filters: filter_language(),
            filterSearch: true,
            sorter: (a, b) => a.language.length - b.language.length,
            sortDirections: ['descend'],
        },
        {
            title: 'Questions',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Question Type',
            dataIndex: 'type',
            key: 'type',
            render: (_, record) => (
                <>
                {
                    record.type == 1 ?
                    <Tag color="blue">MCQ Question</Tag>
                    :
                    <Tag color="green">Program Question</Tag>
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
                            <EditFilled onClick={() => { showEditlModal(record)}}/>
                        </Tooltip>
                        <Tooltip placement="topLeft" title="Edit Test">
                            <DeleteFilled onClick={() => { showDeletelModal(record)}} />
                        </Tooltip>
                    </Space>
                </>
            )
        }
    ]


    const showDeletelModal = (record) => {
        // console.log("SHOW DETAIL", { record })
        setRecord(record);
        setIsModalOpen(record);

    }

    const showEditlModal = (record) => {
        // console.log("SHOW DETAIL---->", { record })
        setRecord(record);
        setIsEditModalOpen(record);
        triggerFetchData(
            `/question_details/${record.id}/${record.type}/`,[], "GET"
        ).then(
            (response) => {
                if (record.type == 1){
                    setquestionDetail(response.data); 
                }   
                else{
                    setTestDetails(response.data);      
                }
            }
        ).catch(reason => message.error(reason));
       
    }

    const handleOk = () => {
        triggerFetchData(
            'delete_question/',{"id": record.id}, "DELETE"
        ).then(
            (data) => {
                // console.log("RESULT",data)
                message.success(data.message);
                fetchData();
            }
        ).catch(reason => message.error(reason));
        
        setIsModalOpen(false);
        
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
    };
    
    const onChange = (pagination, filters, sorter, extra) => {
        let lang = ["python"]
        if (filters.language){
            lang = filters.language
        }
        setFetchUrl("questions?language="+lang);
        fetchData();
    };

    const downloadExcelTemplate = () => {
        generateExcelFromJson(templateJSONData, 'question_template.xlsx');
    }

    const onFinish = async (values) => {   
        var multiple_options = Object.keys(form2.getFieldValue()).length ? form2.getFieldValue(): questionDetail;
        var program_test_cases =  Object.keys(form3.getFieldValue()).length ? form3.getFieldValue(): testDetails;
        
        if (multiple_options){
            delete multiple_options["question_details"];
            values["multiple_options"]=multiple_options
        }   
        if (program_test_cases){
            delete program_test_cases["question_details"];
            values["program_test_cases"]=program_test_cases
        }
        values["difficulty"] = record.difficulty;
        triggerFetchData(
            'add_question/',{"id": record.id, values}
        ).then(
            (data) => {
                message.success('Question Updated Successfully');
                fetchData();
                
            }
        ).catch(reason => message.error(reason));
        
        setIsEditModalOpen(false);
    };

    return (
        <>
        <Layout.Content style={{ height: '100vh', padding: '1rem' }}>
             <div style={{ float: 'right', marginBottom: '10px', marginLeft: '10px', marginRight: '10px' }}>
                <Button onClick={() => downloadExcelTemplate()}>Download Excel Template</Button>
            </div>
            <div style={{ float: 'right', marginBottom: '10px' }}>
                <Upload
                    type="file"
                    accept=".xlsx"
                    showUploadList={true}
                    beforeUpload={file => {
                        const excelObj = readExcel(file);
                        excelObj.then(data => 
                            {console.log("NEW UPLOAD DATA", data)
                            triggerFetchData('bulk_questions/',data).then(data => fetchData());  
                        });
                        return false;
                    }}
                >
                    <Button icon={<UploadOutlined />}> Bulk Upload (.xlsx)
                    </Button>
                </Upload>
            </div>
            
            <Table bordered loading={isLoading} columns={columns} dataSource={apiData ? apiData.data : []} onChange={onChange} />     
            {/* Delete Modal */}
            <Modal title={isModalOpen.name} open={isModalOpen} onOk={() => handleOk()} onCancel={handleCancel} okText="Yes">
            <Divider></Divider>
                <p>Are you sure you want to permanently remove this question?</p>
            </Modal>

            {/* Edit Modal */}
            <Modal title="Edit Question" open={isEditModalOpen} onOk={form.submit} onCancel={handleCancel} okText="Update">
            <Divider></Divider>
                <Form 
                    form={form}
                    // name="basic"
                    labelCol={{
                        span: 8,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={record}
                    onFinish={onFinish}
                    key = "main_form"
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    {columns.map((item, index) => (
                        
                        <Form.Item
                            style={item.title == 'Action' ? { display: 'none'} : null}
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
                            {item.title == "Question Type" ?
                            <Input disabled/> :
                            <Input />
                            
                            }
                           
                        </Form.Item>
                        
                    ))} 
                    {
                        questionDetail ?
                        <>
                        <Collapse  key={`collapse-index}`} defaultActiveKey={['1']} >
                        <Panel header="Question Details" key={`panel-index`}>
                        <Form 
                                form={form2}
                                // name="basic"
                                labelCol={{
                                    span: 8,
                                }}
                                wrapperCol={{
                                    span: 16,
                                }}
                                style={{
                                    maxWidth: 600,
                                }}
                                key = "panel_form"
                                initialValues={questionDetail}
                                onFinish={onFinish}
                                // onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                           
                            {optionList?.map((item, index) => (
                                
                            <Form.Item
                                style={item.title == 'Action' ? { display: 'none'} : null}
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
                                {item.title == "Question Type" ?
                                <Input disabled/> :
                                <Input />
                                
                                }
                            
                            </Form.Item>
                        ))}

                        </Form>
                       </Panel>
                        </Collapse>
                        </>
                        :
                        <Collapse  key={`collapse-index}`} defaultActiveKey={['1']} >
                        <Panel header="Test Details" key={`panel-index`}>
                        <Form 
                                form={form3}
                                // name="basic"
                                labelCol={{
                                    span: 8,
                                }}
                                wrapperCol={{
                                    span: 16,
                                }}
                                style={{
                                    maxWidth: 600,
                                }}
                                key = "panel_form"
                                initialValues={testDetails}
                                onFinish={onFinish}
                                // onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                        {caseList?.map((item, index) => (
                                
                                <Form.Item
                                    style={item.title == 'Action' ? { display: 'none'} : null}
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
                                    {item.title == "Question Type" ?
                                    <Input disabled/> :
                                    <Input />
                                    
                                    }
                                
                                </Form.Item>
                            ))}
                        </Form>
                        </Panel>
                        </Collapse>
                    }               
                    
                    
                </Form>
               </Modal>
           
        </Layout.Content>
        </>
    )

}

Question.propTypes = {
    setSelectedKey: PropTypes.func,
};

Question.defaultProps = {
    setSelectedKey: (key) => {console.log(key);}
};

export default Question;
