import React, { useState, useEffect } from "react";
import {
  Input,
  Layout,
  Button,
  message,
  Table,
  Modal,
  Collapse,
  Space,
  Tooltip,
  Tag,
} from "antd";
import { triggerFetchData } from "../Utils/Hooks/useFetchAPI";
import { useFetch } from "../Utils/Hooks/useFetchAPI";
import { EditFilled, EyeFilled } from "@ant-design/icons";
import AddTest from "../components/AddTest";
import PropTypes from "prop-types";
import "../styles/create-test.css";
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
  let filter_test_data = [];
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const [isEditTestModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewTestModalOpen, setIsViewTestModalOpen] = useState(false);
  const [rowRecord, setRowRecord] = useState(false);
  const [testRecord, setTestRecord] = useState(null);
  const [dataList, setDataList] = useState([]);

  const { isLoading, serverError, apiData, fetchData } =
    useFetch("get_test_list");

  // trigger on component mount
  useEffect(() => {
    props.setSelectedKey("create-test");
  }, []);

  const filter_test = () => {
    if (apiData) {
      apiData.data.map((data, index) => {
        if (!filter_test_data.some((item) => data.name === item.value)) {
          filter_test_data.push({ value: data.name, text: data.name });
        }
      });
    }
    return filter_test_data;
  };

  const columns = [
    {
      title: "Test Name",
      dataIndex: "name",
      key: "name",
      filters: filter_test(),
      onFilter: (value, testRecord) => testRecord.name.indexOf(value) === 0,
      filterMultiple: true,
      // // render: (text) => <p>{text}</p>,
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord);
            }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: "Total Questions",
      dataIndex: "total_questions",
      key: "total_questions",
    },
    {
      title: "Type",
      dataIndex: "is_active",
      key: "is_active",
      render: (_, testRecord) => (
        <>
          {testRecord.is_active == true ? (
            <Tag color="blue">Active</Tag>
          ) : (
            <Tag color="pink">Deactivate</Tag>
          )}
        </>
      ),
    },
    {
      title: "Action",
      render: (_, testRecord) => (
        <>
          <Space>
            <Tooltip placement="topLeft" title="View Test">
              <EyeFilled
                onClick={() => {
                  openDetailModal(testRecord);
                }}
              />
            </Tooltip>
            <Tooltip placement="topLeft" title="Edit Test">
              <EditFilled
                onClick={() => {
                  openEditModal(testRecord);
                }}
              />
            </Tooltip>
            <Tooltip
              placement="topLeft"
              title={testRecord.is_active ? "Deactivate" : "Activate"}
            >
              <label className="toggle">
                <Input
                  className="toggle-checkbox"
                  type="checkbox"
                  onClick={() => {
                    showDeactivateModal(testRecord);
                  }}
                  checked={testRecord.is_active}
                />
                <div className="toggle-switch"></div>
              </label>
            </Tooltip>
          </Space>
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  console.log("testRecord:::", testRecord);
  console.log("dataList:::", dataList);
  console.log("rowRecord:::", rowRecord);

  // Function to open details Test Model
  const openDetailModal = (testRecord) => {
    setIsViewTestModalOpen(true);
    setRowRecord(testRecord);
  };

  // Function to close details Test Model
  const closeDetailModal = (testRecord) => {
    setIsViewTestModalOpen(false);
    setRowRecord(null);
  };

  // Function to open deactivate Test Model
  const showDeactivateModal = (testRecord) => {
    setIsDeleteModalOpen(true);
    setTestRecord(testRecord);
  };

  // Function to close deactivate Test Model
  const closeDeactivateModal = () => {
    setIsDeleteModalOpen(false);
    setRowRecord(null);
  };

  // Function to deactivate the test
  const handleDeactivate = (testStatus) => {
    triggerFetchData(`deactivate_test/?testId=${testRecord.id}`, [], "PATCH")
      .then((data) => {
        // console.log("RESULT",data)
        message.success(data.message);
        fetchData();
      })
      .catch((reason) => message.error(reason));

    setIsDeleteModalOpen(false);
    setRowRecord(null);
  };

  // Function to open Add Test Model
  const openAddNewTestModal = () => {
    setIsAddTestModalOpen(true);
  };

  // Function to close Add and Edit Test Model
  const closeAddNewTestModal = () => {
    setIsAddTestModalOpen(false);
    setIsEditModalOpen(false);
    setTestRecord(null);
    setDataList([]);
  };

  // Function to open Edit existing Test Model
  const openEditModal = (testRecord) => {
    let form_val = {
      ...testRecord,
      ...testRecord.question_details,
    };
    setTestRecord(form_val);
    setIsEditModalOpen(true);
    setDataList((oldArray) => [
      ...oldArray,
      { name: testRecord.name, question_details: testRecord.question_details },
    ]);
  };

  return (
    <>
      {/* Mutate Mode */}
      <Layout.Content style={{ height: "100vh", padding: "1rem" }}>
        <Button type="primary" onClick={openAddNewTestModal}>
          Add New Test
        </Button>

        {/* Table */}
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={apiData ? apiData.data : []}
          onChange={onChange}
        />

        {/* Deactivate and Activate Confirmation Pop-up */}
        <Modal
          title={isDeleteModalOpen.name}
          open={isDeleteModalOpen}
          onOk={() => handleDeactivate(testRecord && testRecord.is_active)}
          onCancel={closeDeactivateModal}
          okText="Yes"
        >
          <p>
            Are you sure you want to{" "}
            {testRecord && testRecord.is_active ? `deactivate` : `activate`}{" "}
            this test?
          </p>
        </Modal>

        {/* Add New Test Modal */}
        {isAddTestModalOpen || isEditTestModalOpen ? (
          <AddTest
            isAddTestModalOpen={isAddTestModalOpen}
            isEditTestModalOpen={isEditTestModalOpen}
            fetchData={fetchData}
            testRecord={testRecord}
            dataList={dataList}
            setDataList={setDataList}
            closeAddNewTestModal={closeAddNewTestModal}
            openDetailModal={openDetailModal}
          />
        ) : null}
      </Layout.Content>

      {/* View Test Modal */}
      {isViewTestModalOpen && (
        <Modal
          title={rowRecord.name}
          open={isViewTestModalOpen}
          onCancel={closeDetailModal}
          footer={null}
        >
          {rowRecord?.question_details?.map((item, index) => (
            <>
              <Collapse
                key={`collapse-index-${index}`}
                defaultActiveKey={["1"]}
              >
                <Panel header={item.language}>
                  {
                    <ul>
                      <li> MCQ Count: {item.mcq_count}</li>
                      <li> Easy Program: {item.easy_program_count}</li>
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
    </>
  );
};

CreateTest.propTypes = {
  setSelectedKey: PropTypes.func,
};

CreateTest.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key);
  },
};

export default CreateTest;
