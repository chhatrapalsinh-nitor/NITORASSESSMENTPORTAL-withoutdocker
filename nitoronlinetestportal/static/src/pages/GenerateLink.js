import React, { useState, useEffect } from 'react'
import {
  Input,
  Layout,
  Button,
  message,
  Space,
  Table,
  Modal,
  Form,
  DatePicker,
  Select,
  Collapse,
  Tooltip,
} from 'antd'
import { useFetch, triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import ClipboardCopy from '../components/ClipboardCopy'
import { baseURL, TestLinkTable } from '../Utils/constants'
import openLinkSvg from '../components/OpenLink'
import Icon from '@ant-design/icons'
import PropTypes from 'prop-types'

const { Panel } = Collapse

const OpenLinkIcon = (props) => <Icon component={openLinkSvg} {...props} />

/* 
  This components represent all the generated test link in table formate
  Also, we can create new test link with the help of this component
*/
const GenerateLink = (props) => {
  let filter_test_data = []
  let filter_test_link_data = []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [endDate, setEndDate] = useState()
  const [testList, setTestList] = useState()
  const [rowRecord, setRowRecord] = useState(false)
  const [record, setRecord] = useState(null)

  const { isLoading, serverError, apiData, fetchData } = useFetch('get_test_link')

  // Trigger on component mount for setting the header tab
  useEffect(() => {
    props.setSelectedKey('generate-link')
    getTestList()
  }, [])

  // Get all the test details to show in select options
  const getTestList = () => {
    triggerFetchData('get_test_list/', {}, 'GET')
      .then((data) => {
        setTestList(data.data)
      })
      .catch((reason) => message.error(reason))
  }

  if (testList) {
    testList.map((data, index) => {
      if (!filter_test_data.some((item) => data.name === item.value)) {
        filter_test_data.push({ label: data.name, value: data.id })
      }
    })
  }

  // Function to filter the generated test link table
  const filterTestLink = () => {
    if (apiData) {
      apiData.data?.map((data, index) => {
        if (!filter_test_link_data.some((item) => data.name === item.name)) {
          filter_test_link_data.push({ value: data.name, text: data.name })
        }
      })
    }
    return filter_test_link_data
  }

  // Function to go on screen test page
  const goToScreeningTest = (record, history) => {
    window.open(`/#/screening/user-details/${record.test}/${record.key}`, '_blank')
  }

  // Tables column
  const list_columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: filterTestLink(),
      onFilter: (value, record) => record.name.indexOf(value) === 0,
      filterSearch: true,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend'],
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
    },

    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
    },

    {
      title: 'Test',
      dataIndex: 'test',
      key: 'test',
      render: (text, record) => (
        <>
          <a
            onClick={() => {
              showDetailModal(record)
            }}
          >
            {record.test_details.name}
          </a>
        </>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <>
          <Space>
            <div>
              <ClipboardCopy
                copyText={`${baseURL}#/screening/user-details/${record.test}/${record.key}`}
              />
            </div>
            <Tooltip placement="top" title="Open Link">
              <OpenLinkIcon
                style={{
                  fontSize: '32px',
                }}
                onClick={() => goToScreeningTest(record)}
              />
            </Tooltip>
          </Space>
        </>
      ),
    },
  ]

  const onTableChange = (pagination, filters, sorter, extra) => {
    console.log('value:', pagination, filters, sorter, extra)
  }

  const handleOk = (values) => {
    setRowRecord(null)
  }

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    setEndDate(dateString)
  }

  // Function to show details view
  const showDetailModal = (record) => {
    setRecord(record)
    setRowRecord(true)
  }

  // Function to open form
  const showGeneratedTestLinkModal = () => {
    setIsModalOpen(true)
  }

  // Function to close form
  const closeGeneratedTestLinkModal = () => {
    setIsModalOpen(false)
    setRowRecord(null)
  }

  // Function to submit the Generate Test Link Form
  const submitGeneratedLinkForm = async (values) => {
    let end_date = endDate + ' 00:00:00'
    values.end_date = end_date
    triggerFetchData('generate_test_link/', values)
      .then((data) => {
        message.success('Test Link Generated')
        setIsModalOpen(false)
        fetchData()
      })
      .catch((reason) => message.error(reason))
  }

  // Function to handle the Form failed
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <>
      <Layout.Content style={{ height: '100vh', padding: '1rem' }}>
        <Button type="primary" onClick={showGeneratedTestLinkModal}>
          Generate Test Link
        </Button>
        <Table
          columns={list_columns}
          dataSource={apiData ? apiData.data : []}
          onChange={onTableChange}
        />
        <Modal
          title="Generate Test Link"
          open={isModalOpen}
          onOk={form.submit}
          onCancel={closeGeneratedTestLinkModal}
        >
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
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={submitGeneratedLinkForm}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {TestLinkTable.map((item, index) => (
              <>
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
                  {item.dataIndex === 'end_date' ? (
                    <DatePicker
                      style={{ width: 100 + '%' }}
                      onChange={onDateChange}
                    />
                  ) : item.dataIndex == 'test' ? (
                    <Select
                      showSearch
                      placeholder="Select a person"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={filter_test_data}
                    />
                  ) : (
                    <Input />
                  )}
                </Form.Item>
              </>
            ))}
          </Form>
        </Modal>
      </Layout.Content>

      {rowRecord && (
        <>
          <Modal
            title={record.test_details.name}
            open={rowRecord}
            onOk={handleOk}
            onCancel={closeGeneratedTestLinkModal}
          >
            {record.test_details?.question_details?.map((item, index) => (
              <Collapse key={`collapse-index-${index}`} defaultActiveKey={['1']}>
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
            ))}
          </Modal>
        </>
      )}
    </>
  )
}

GenerateLink.propTypes = {
  setSelectedKey: PropTypes.func,
}

GenerateLink.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key)
  },
}

export default GenerateLink
