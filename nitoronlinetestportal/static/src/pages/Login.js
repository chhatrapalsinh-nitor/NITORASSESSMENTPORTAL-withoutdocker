import React, { useEffect } from "react";
import { withRouter } from 'react-router-dom'
import { Button, Checkbox, Form, Input, Row, Col, Image, Typography, Layout, message } from 'antd';
import "../styles/login.css";
import Nitor_white_logo from "../assets/Nitor_white_logo.png";
import { LoginAPI } from "../Utils/Hooks/useFetchAPI";

const Login = ({ setIsLoggedIn, history }) => {


    const onFinish = async (values) => {
        console.log('Success:', values);
        const res = await LoginAPI(values)
        if (res.status == 200) {
            setIsLoggedIn(Boolean(res?.data?.data?.username))
            res.data.authdata = window.btoa(values.username + ':' + values.password);
            localStorage.setItem('authdata', JSON.stringify(res.data.authdata));
            message.success("Login Successfully");
            history.push('/dashboard')
        } else {
            message.error("Wrong Credentials");

        }
    }

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    
    useEffect(() => {
        const isUserExists = !!JSON.parse(localStorage.getItem("authdata"));
        if(isUserExists){
            history.push('/dashboard');
        }
    }, [])
    
    return (
        <Layout className="layout parent-container">
            <div className="card-style">
                <Row className="row-style">
                    <Col span={12} className="col-logo">
                        <Image src={Nitor_white_logo} alt="Nitor Logo" preview={false} />
                    </Col>
                    <Col span={12} className="col-form">
                        <Form
                            name="basic"
                            labelCol={{
                                span: 24,
                            }}
                            wrapperCol={{
                                span: 24,
                            }}
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Typography.Title level={3}>Log in</Typography.Title>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your username!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="remember"
                                valuePropName="checked"
                                wrapperCol={{
                                    offset: 12,
                                    span: 12,
                                }}
                            >
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Form.Item
                                wrapperCol={{
                                    span: 24,
                                }}
                            >
                                <Button type="primary" htmlType="submit" block>
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>

        </Layout>
    );
}

export default withRouter(Login);