import React, { useEffect, useState } from 'react'
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
  DatePicker,
  Col,
} from 'antd'
import {
  CreateTestForm_1,
  CreateTestForm_2,
  CreateTestForm_3,
  initialNewTestValues,
  testSectionOption,
  languageOptions,
} from '../Utils/constants'
import { CloseOutlined } from '@ant-design/icons'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
const { Panel } = Collapse

const constInitialQuestionsValue = {
  easy_mcq_count: 0,
  easy_program_count: 0,
  hard_mcq_count: 0,
  hard_program_count: 0,
  mcq_difficulty: 0,
  medium_mcq_count: 0,
  medium_program_count: 0,
}

const CreateNewTest = ({
  isAddTestModalOpen,
  closeAddNewTestModal,
  openDetailModal,
  fetchData,
  testRecord,
  dataList,
  setDataList,
}) => {
  const [form] = Form.useForm()
  const [componentDisabled, setComponentDisabled] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [showEditSection, setShowEditSection] = useState(false)
  const [showAddTestError, setShowAddTestError] = useState(false)
  const [showNotEnoughQuesError, setShowNotEnoughQuesError] = useState(false)
  const [showNotEnoughQuesErrorMessage, setShowNotEnoughQuesErrorMessage] =
    useState('')
  const [dynamicScore, setDynamicScore] = useState(0)
  const [initialQuestionsValue, setInitialQuestionsValue] = useState(
    constInitialQuestionsValue,
  )
  const [totalScoreWeightage, setTotalScoreWeightage] = useState(0)

  const [endDate, setEndDate] = useState()
  const [addedSections, setAddedSections] = useState([])

  // Updating the Score Weightage dynamically
  useEffect(() => {
    const calculatedScore = calculateWeightage(initialQuestionsValue)
    setDynamicScore(calculatedScore)
  }, [initialQuestionsValue])

  // Updating the Total Score Weightage dynamically
  useEffect(() => {
    let sum = 0
    dataList.map((data) => {
      sum = sum + data.weightage
    })
    setTotalScoreWeightage(sum)
  }, [dataList])

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

  const removeDataList = (testRecord) => {
    let filterArray = dataList.filter((item) => item.name !== testRecord.name)
    setDataList(filterArray)
  }

  // Function to Update the Score Weightage dynamically
  const handleCountInputChange = (index, value) => {
    setInitialQuestionsValue((pre) => {
      let temp = Object.assign({}, pre)
      value == '' ? (temp[index] = 0) : (temp[index] = value)
      return temp
    })
  }

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    setEndDate(dateString)
  }

  const handleAddSection = (value) => {
    setAddedSections(value)
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
  const handleCreateNewTest = (param) => {
    let values = { ...initialNewTestValues, ...param }
    let name = values['name']
    let end_date = values['end_date']
    let weightage = calculateWeightage(values)
    let form_data = {
      name: name,
      end_date: end_date,
      weightage: weightage,
      question_details: [values],
    }

    triggerFetchData('validate_test/', form_data)
      .then((data) => {
        if (dataList.length == 0) {
          setDataList((oldArray) => [...oldArray, form_data])
          setComponentDisabled(false)
        } else {
          let filterArray = dataList.filter((item) => item.name == name)
          filterArray.map((item) => {
            form_data.question_details = [item.question_details[0], values]
            setDataList((oldArray) => [...oldArray, form_data])
          })
        }
        setShowNotEnoughQuesErrorMessage('')
        setShowNotEnoughQuesError(false)
      })
      .catch((reason) => {
        setShowNotEnoughQuesErrorMessage(reason && reason.error && reason.message)
        setShowNotEnoughQuesError(reason && reason.error)
      })

    setShowEditSection(false)
  }

  return (
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
            span: 12,
          }}
          wrapperCol={{
            span: 12,
          }}
          style={{
            maxWidth: 'none',
          }}
          layout="inline"
          initialValues={initialNewTestValues}
          onFinish={handleCreateNewTest}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <>
            <Col span={24}>
              {/* Other Tops Fields */}
              <Row>
                {CreateTestForm_1.map((item, index) => (
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
                          placeholder="Select a language"
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '')
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={languageOptions}
                        />
                      ) : item.dataIndex === 'add_sections' ? (
                        <Select
                          mode="multiple"
                          allowClear
                          style={{ width: '100%' }}
                          placeholder="Please select"
                          defaultValue={[]}
                          onChange={handleAddSection}
                          options={testSectionOption}
                        />
                      ) : item.dataIndex === 'end_date' ? (
                        <DatePicker
                          style={{ width: 100 + '%' }}
                          onChange={onDateChange}
                          disabled={!componentDisabled}
                        />
                      ) : item.dataIndex == 'name' ? (
                        <Input disabled={!componentDisabled} />
                      ) : null}
                    </Form.Item>
                    <br></br>
                  </Col>
                ))}
              </Row>
              {/* MCQ Fields */}
              {addedSections.includes('Add_MCQs') && (
                <Row justify="start">
                  <Col span={24}>
                    <h4>MCQ Count</h4>
                  </Col>
                  {CreateTestForm_2.map((item, index) => (
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
                      </Form.Item>
                      <br></br>
                    </Col>
                  ))}
                </Row>
              )}
              {/* Program Fields */}
              {addedSections.includes('Add_Programs') && (
                <Row justify="start">
                  <Col span={24}>
                    <h4>Program Count</h4>
                  </Col>
                  {CreateTestForm_3.map((item, index) => (
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
                      </Form.Item>
                      <br></br>
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </>

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
            {showNotEnoughQuesError && (
              <p style={{ color: 'red' }}>{showNotEnoughQuesErrorMessage}</p>
            )}
            <p>
              <b>Score Weightage: </b>
              {dynamicScore}
            </p>
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
            marginTop: '8px',
          }}
        >
          {showAddTestError && (
            <p style={{ color: 'red' }}>Please add at least one Test!</p>
          )}
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            marginTop: '8px',
          }}
        >
          <p>
            <b>Total Score Weightage: </b> {totalScoreWeightage}
          </p>
        </div>
      </Row>
    </Modal>
  )
}

export default CreateNewTest
