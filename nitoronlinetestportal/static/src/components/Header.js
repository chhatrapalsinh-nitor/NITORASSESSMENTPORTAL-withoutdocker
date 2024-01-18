import React from "react";
import { Layout, Menu, Image, Row, Col, Button } from "antd";
import { withRouter, useHistory, Link } from 'react-router-dom';
import { LoginOutlined } from '@ant-design/icons';
import { LogoutAPI } from "../Utils/Hooks/useFetchAPI";
import { message } from 'antd';
import PropTypes from 'prop-types';

import NitorLogo from "../assets/Nitor_white_logo.png";

const logOutUser = async(history) => {
    const res = await LogoutAPI();
    if (res.status == 200) {
        localStorage.removeItem("authdata");
        message.success(res.data.message);
        history.push("/");
    }
    else {
        message.error("Something went wrong!");

    }
}

const Header = (props) => {
    const history = useHistory();
    return (
        <Layout.Header>
            <Row>
                <Col span={2}>
                    <Image src={NitorLogo} alt="Nitor Logo" width={100} preview={false} />
                </Col>
                {history.location.pathname.includes("/screening") 
                ?
                null
                :
                <>
                    <Col span={21}>
                        <Menu
                            // style={{float: 'right'}}
                            theme="dark"
                            mode="horizontal"
                            defaultSelectedKeys={[props.selectedKey]}
                            // items={['Dashboard', 'Created Test Details', ' Create Test', 'Questions', 'Generate Link', 'Candidate Test', 'Generate Test', 'Test Code Editor'].map((navText, index) => {
                            //     const key = index + 1;
                            //     return {
                            //         key,
                            //         label: `${navText}`,
                            //     };
                            // })}
                        >
                            <Menu.Item key="dashboard">
                                <span>Dashboard</span>
                                <Link to="/dashboard" />
                            </Menu.Item>
                            <Menu.Item key="created-test-details">
                                <span>Created Test Details</span>
                                <Link to="/created-test-details" />
                            </Menu.Item>
                            <Menu.Item key="create-test">
                                <span>Create Test</span>
                                <Link to='/create-test' />
                            </Menu.Item>
                            <Menu.Item key="questions">
                                <span>Questions</span>
                                <Link to='/questions' />
                            </Menu.Item>
                            <Menu.Item key="generate-link">
                                <span>Generate Link</span>
                                <Link to='/generate-link' />
                            </Menu.Item>
                            {/* <Menu.Item key="generate-test">
                                <span>Generate Test</span>
                                <Link to="/test/:id/:key" />
                            </Menu.Item> */}
                            {/* <Menu.Item key="candidate-tes">
                                <span>Candidate Test</span>
                                <Link to='/candidate-test' />
                            </Menu.Item> */}
                            {/* <Menu.Item key="test-code-editor">
                                <span>Test Code Editor</span>
                                <Link to='/test-code-editor' />
                            </Menu.Item> */}
                        </Menu>
                    </Col>
                    <Col span={1} flex="none">
                        <Button type="primary" shape="round" icon={<LoginOutlined size='small' onClick={() => logOutUser(history)} />} />
                    </Col>
                
                </>
                }
            </Row>
        </Layout.Header>
    )
}

Header.propTypes = {
    selectedKey: PropTypes.string,
};

Header.defaultProps = {
    selectedKey: 'dashboard'
};

export default withRouter(Header);
