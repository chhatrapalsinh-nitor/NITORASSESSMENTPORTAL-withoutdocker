import React, { useState } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom'
import Login from "./Login";
import Dashboard from "./Dashboard";
import CandidateTest from "./CandidateTest";
import CreatedTestDetails from "./CreatedTestDetails";
import CreateTest from "./CreateTest";
import TestCodeEditor from "./TestCodeEditor";
import GenerateLink from "./GenerateLink";
import GenerateTest from './GenerateTest';
import Protected from "../components/Protected";
import Question from './Question';
import UserDetail from './UserDetails';
import { Layout } from "antd";
import Header from '../components/Header';

const App = () => {
  const isUserExists = !!JSON.parse(localStorage.getItem("authdata"));
  const [isLoggedIn, setIsLoggedIn] = useState(isUserExists);
  const [selectedKey, setSelectedKey] = useState('');

  return (
    <Layout>
      <Switch>
        <Route exact path='/'>
          <Login setIsLoggedIn = {setIsLoggedIn}/>
        </Route>
        <Protected isLoggedIn={isLoggedIn}>
          <Header selectedKey={selectedKey} />
          <Route path='/dashboard'>
            <Dashboard setSelectedKey={setSelectedKey} />
          </Route>
          <Route path='/created-test-details'>
            <CreatedTestDetails setSelectedKey={setSelectedKey} />
          </Route>
          <Route path='/create-test'>
            <CreateTest setSelectedKey={setSelectedKey} />
          </Route>
          <Route path='/questions'>
            <Question setSelectedKey={setSelectedKey} />
          </Route>
          <Route path='/generate-link'>
            <GenerateLink setSelectedKey={setSelectedKey} />
          </Route>
          <Route path='/screening/user-details/:id/:key'>
            <UserDetail />
          </Route>
          <Route path="/screening/test/:id/:key">
            <GenerateTest />
          </Route>
          <Route path='/candidate-test'>
            <CandidateTest />
          </Route>
          <Route path='/test-code-editor'>
            <TestCodeEditor />
          </Route>
        </Protected>
      </Switch>
    </Layout>
  )
};
export default withRouter(App);