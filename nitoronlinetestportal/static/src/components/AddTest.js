import React, { useState } from 'react'
import {
  Input,
  Button,
  message,
  Divider,
  Table,
  Modal,
  Collapse,
  Form,
  Space,
  Tooltip,
  Select,
  Row,
  Col,
} from 'antd'
import { CreateTestForm, languageOptions } from '../Utils/constants'
import { CloseOutlined } from '@ant-design/icons'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
const { Panel } = Collapse

const AddTest = ({
  isAddTestModalOpen,
  isEditTestModalOpen,
  closeAddNewTestModal,
  openDetailModal,
  fetchData,
  testRecord,
  dataList,
  setDataList,
}) => {
  const [form] = Form.useForm()
  const [componentDisabled, setComponentDisabled] = useState(true)
  const [difficultyLevel, setDifficultyLevel] = useState('1')
  const [activeTab, setActiveTab] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [showEditSection, setShowEditSection] = useState(false)
  const [showAddTestError, setShowAddTestError] = useState(false)
  const [showNotEnoughQuesError, setShowNotEnoughQuesError] = useState(false)
  const [showNotEnoughQuesErrorMessage, setShowNotEnoughQuesErrorMessage] =
    useState('')

  const [dynamicScore, setDynamicScore] = useState(0)

  let tempQuestions = {
    easy_mcq_count: 0,
    easy_program_count: 0,
    hard_mcq_count: 0,
    hard_program_count: 0,
    mcq_difficulty: 0,
    medium_mcq_count: 0,
    medium_program_count: 0,
  }

  // Table in Add New Test Modal
  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
      width: '400px',
      // colSpan: 16,
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord)
            }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: 'Score Weightage',
      dataIndex: 'weightage',
      key: 'weightage',
      width: '400px',
      // colSpan: 16,
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord)
            }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: 'Action',
      render: (_, testRecord) => (
        <>
          <Space>
            <Tooltip placement="topLeft" title="Remove From List">
              <CloseOutlined
                onClick={() => {
                  removeDataList(testRecord)
                }}
              />
            </Tooltip>
          </Space>
        </>
      ),
    },
  ]

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra)
  }

  // Function to add new test
  const createTest = () => {
    if (testRecord) {
      dataList[0]['id'] = testRecord.id
    }

    if (dataList.length === 0) {
      setShowAddTestError(true)
      return
    }

    triggerFetchData('create_update_test/', dataList[dataList.length - 1])
      .then((data) => {
        message.success('Test created')
        fetchData()
      })
      .catch((reason) => message.error(reason))
    closeAddNewTestModal()
    form.resetFields()
  }

  // Function to add form data to List with Score Weightage
  const handleCreateNewTest = (values) => {
    let name = values['name']
    delete values['name']
    values['mcq_difficulty'] = difficultyLevel
    let weightage = calculateWeightage(values)
    let form_data = {
      name: name,
      weightage: weightage,
      question_details: [values],
    }

    if (dataList.length == 0) {
      setDataList((oldArray) => [...oldArray, form_data])
      setComponentDisabled(false)
      setShowAddTestError(false)
    } else {
      let filterArray = dataList.filter((item) => item.name == name)
      filterArray.map((item) => {
        form_data.question_details = [item.question_details[0], values]
        setDataList((oldArray) => [...oldArray, form_data])
      })
      setShowAddTestError(false)
    }

    setShowEditSection(false)
  }

  // Function to edit existing test
  const handleEditTest = (values) => {
    delete values['name']
    values['language'] = selectedLanguage ? selectedLanguage : activeTab
    values['mcq_difficulty'] = difficultyLevel
    let dList = {}
    let weightage = calculateWeightage(values)

    dataList.map((item) => {
      let index = item.question_details.findIndex(
        (obj) => obj.language === activeTab,
      )
      item.question_details[index] = values
      item.weightage = weightage
      setSelectedLanguage('')
      dList = item
    })
    setDataList([dList])
  }

  // Function to Calculate Weightage
  const calculateWeightage = (question) => {
    const weights = {
      easy_program_count: 5,
      medium_program_count: 10,
      hard_program_count: 15,
      easy_mcq_count: 5,
      medium_mcq_count: 5,
      hard_mcq_count: 5,
    }

    let score = 0

    for (const key in weights) {
      const count = parseInt(question[key])
      if (count !== 0) {
        score += weights[key] * count
      }
    }
    return score
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const selectAfter = (rec) => {
    return (
      <Select defaultValue={rec ? rec.mcq_difficulty : '1'} onChange={handleChange}>
        <Option value="1">Easy</Option>
        <Option value="2">Medium</Option>
        <Option value="3">Hard</Option>
      </Select>
    )
  }

  const handleChange = (value) => {
    isNaN(value) ? setSelectedLanguage(value) : setDifficultyLevel(value)
  }

  const removeDataList = (testRecord) => {
    let filterArray = dataList.filter((item) => item.name !== testRecord.name)
    setDataList(filterArray)
  }

  const onCollapseChange = (key) => {
    setActiveTab(key)
  }

  const handleCountInputChange = (index, value) => {
    tempQuestions[index] = value
    const score = calculateWeightage(tempQuestions)
    setDynamicScore(isNaN(score) ? 0 : score)
  }

  return (
    <>
      {!isEditTestModalOpen ? (
        <Modal
          title="Add New Test"
          open={isAddTestModalOpen}
          onOk={createTest}
          onCancel={closeAddNewTestModal}
          width={900}
          okText="Submit"
        >
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
              initialValues={testRecord}
              onFinish={handleCreateNewTest}
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
                      {item.dataIndex == 'language' ? (
                        <Select
                          showSearch
                          placeholder="Select a person"
                          optionFilterProp="children"
                          // onChange={onChange}
                          // onSearch={onSearch}
                          filterOption={(input, option) =>
                            (option?.label ?? '')
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={languageOptions}
                        />
                      ) : item.dataIndex == 'mcq_count' ? (
                        <Input addonAfter={selectAfter()} />
                      ) : item.dataIndex == 'name' ? (
                        <Input disabled={!componentDisabled} />
                      ) : (
                        <Input
                          type="text"
                          onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault()
                            }
                          }}
                          onChange={(e) =>
                            handleCountInputChange(item.dataIndex, e.target.value)
                          }
                        />
                      )}
                    </Form.Item>
                    <br></br>
                  </Col>
                </>
              ))}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Button type="primary" ghost onClick={form.submit}>
                  Add To List
                </Button>
                <p>Score Weightage: {dynamicScore}</p>
              </div>

              <Divider></Divider>
            </Form>
            <Table
              columns={columns}
              dataSource={dataList ? dataList : question_details}
              onChange={onChange}
            />
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showAddTestError && <p>Please add at least one Test!</p>}
              {showNotEnoughQuesError && (
                <p style={{ color: 'red' }}>{showNotEnoughQuesErrorMessage}</p>
              )}
            </div>
          </Row>
        </Modal>
      ) : (
        <Modal
          title="Edit Test"
          open={isEditTestModalOpen}
          onOk={createTest}
          onCancel={closeAddNewTestModal}
          width={900}
          okText="Submit"
        >
          <>
            {testRecord?.question_details?.map((rec, index) => (
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
                initialValues={{ name: testRecord.name, ...rec }}
                onFinish={handleEditTest}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Col span={24}>
                  <Collapse
                    accordion
                    key={`collapse-index-${index}`}
                    onChange={onCollapseChange}
                  >
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
                                  {item.dataIndex == 'language' ? (
                                    <Select
                                      showSearch
                                      placeholder="Select a person"
                                      optionFilterProp="children"
                                      defaultValue={rec[item.dataIndex]}
                                      filterOption={(input, option) =>
                                        (option?.label ?? '')
                                          .toLowerCase()
                                          .includes(input.toLowerCase())
                                      }
                                      options={languageOptions}
                                      onChange={handleChange}
                                    />
                                  ) : item.dataIndex == 'mcq_count' ? (
                                    <Input
                                      addonAfter={selectAfter(rec)}
                                      defaultValue={rec[item.dataIndex]}
                                    />
                                  ) : item.dataIndex == 'name' ? (
                                    <Input
                                      defaultValue={testRecord[item.dataIndex]}
                                      disabled={true}
                                    />
                                  ) : (
                                    <Input
                                      defaultValue={rec[item.dataIndex]}
                                      type="text"
                                      onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                          event.preventDefault()
                                        }
                                      }}
                                    />
                                  )}
                                </Space.Compact>
                              </Form.Item>
                              <br></br>
                            </Col>
                          </>
                        ))}
                        <Button type="primary" ghost onClick={form.submit}>
                          Update
                        </Button>
                      </Row>
                    </Panel>
                  </Collapse>
                </Col>
              </Form>
            ))}
            <br></br>
          </>
        </Modal>
      )}
    </>
  )
}

export default AddTest
