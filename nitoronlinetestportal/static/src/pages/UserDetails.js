import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Tabs, Modal, Card, Row, Col } from 'antd';
import { withRouter, useLocation, useHistory } from 'react-router-dom'
import '../styles/user-details.css'
import { userFormFields } from "../Utils/constants";
import { triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import { CodeOutlined, ClockCircleOutlined, BlockOutlined } from '@ant-design/icons'
import LinkExpired from "../components/LinkExpired";

const UserDeatils = () => {
    const [form] = Form.useForm();
    const [questions, setQuestions] = useState([]);
    const [linkExpire, setLinkExpire] = useState(false);
    const search = useLocation();
    const history = useHistory();
    const path = search.pathname.split("/");
    const [isCompleted, setIsCompleted] = useState("user_details" in localStorage? JSON.parse(localStorage.getItem("user_details"))["completed"]:"user_score_details" in localStorage? JSON.parse(localStorage.getItem("user_score_details"))["textFinished"] : false);


    const getGeneratedTest =(testId) =>{
        let url = `generate_test/?testId=${testId}&key=${path[4]}`;
        if (localStorage.getItem("user_details") != null) {
            url = `generate_test/?testId=${testId}&key=${path[4]}&candidate=${JSON.parse(localStorage.getItem("user_details"))["email"]}`;
        }   
        triggerFetchData(
            url
        ).then((data) => {
            if (data.message == "LinkExpired"){
                setLinkExpire(true);
            }
            else{
                setQuestions(data.data);
                if (localStorage.getItem("user_details") === null) {
                    setShowUserDetails(true);
                }     
            }             
        }).catch(reason => message.error(reason));
    }

    const onFinish = async (values) => {
        values["key"] = path[4]
        values["generated_question"] = questions;
        triggerFetchData(
                'add_user_test_details/', values
            ).then(
                (data) => {
                    if (data.status == 201){
                        localStorage.setItem("user_details", JSON.stringify(data.data));
                        history.push(`/screening/test/${path[3]}/${path[4]}`);
                    }   
                }
            ).catch(reason => message.error(reason));
        form.resetFields();
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    useEffect(() => {
        getGeneratedTest(path[3]);  
        }, [""]);    
    
    return (
        <>
        {linkExpire
        ?
            <LinkExpired modalName="linkExpire" />
        : isCompleted ?
            <LinkExpired modalName="userComplete" />
        :    
        <div className="login-page">
            <div className="login-box">
                <div className="illustration-wrapper">
                <img src="https://mixkit.imgix.net/art/preview/mixkit-left-handed-man-sitting-at-a-table-writing-in-a-notebook-27-original-large.png?q=80&auto=format%2Ccompress&h=700" alt="Login"/>
                </div>
                <Form
                    form={form}
                    name="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <p className="form-title">Welcome</p>
                    <p>Provide user information to take the test.</p>
                    <Tabs>
                        <Tabs.TabPane tab="Login" key="tab-login">
                            {userFormFields.map((item, index) => (
                            
                                <Form.Item
                                name={item.dataIndex}
                                // label={item.title}
                                rules={[
                                    {
                                        required: true,
                                        message: `Please input your ${item.title}`,
                                    },
                                ]}
                                >
                                    <Input size="large"
                                        placeholder={item.title}
                                    />

                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="login-form-button" onClick={form.submit}>
                                CONTINUE
                                </Button>
                                </Form.Item>
                                
                            </Tabs.TabPane>
                            
                            {/* Rules */}
                            <Tabs.TabPane tab="Test Rule" key="tab-rule">
                                <div>
                                <Card>
                                    <Row>
                                        <Col flex={2}>
                                        <p class="text-truncate">
                                            <span class="text-nowrap">
                                                <CodeOutlined className="card-icon"/>
                                            <small title="IDE" >IDE</small>
                                            </span>
                                        </p>
                                        </Col>
                                        <Col flex={3} span={15}>
                                            <p> We recommend having an environment ready, so you can solve problems outside of the browser. </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex={2}>
                                        <p class="text-truncate">
                                            <span class="text-nowrap">
                                            <BlockOutlined className="card-icon"/>
                                            <small title="IDE" >Resources</small>
                                            </span>
                                        </p>
                                        </Col>
                                        <Col flex={3} span={15}>
                                            <p> You can use any documentation, files, or other helpful resources.</p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col flex={2}>
                                        <p class="text-truncate">
                                            <span class="text-nowrap">
                                            <ClockCircleOutlined className="card-icon"/>
                                            <small title="IDE">Duration</small>
                                            </span>
                                        </p>
                                        </Col>
                                        <Col flex={3} span={15}>
                                        <p>30 minutes<small title="IDE">(no breaks allowed)</small></p>
                                        </Col>
                                    </Row>    
                                </Card>    
                                </div>
                            </Tabs.TabPane>
                    </Tabs>    
                </Form>

            {isCompleted ?
                <LinkExpired showModal={isCompleted} />
            :
            <></>
            }
              
            </div>

        </div>
        }
        </>
    )
}

export default withRouter(UserDeatils);