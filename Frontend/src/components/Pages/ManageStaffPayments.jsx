/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  markAttendance,
  getAttendanceRecords,
  createSalaryRecord,
  markSalaryPaid,
  getSalaryRecords,
} from "../Redux/Slices/staffManagementSlice";
import { fetchAllUsers } from "../Redux/Slices/userSlice"; // Import fetchAllUsers
import FloatingSidebar from "../Layout/FloatingSidebar";
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Spin,
  notification,
  Layout,
  Typography,
  Row,
  Col,
  Card,
  DatePicker,
  InputNumber,
  Popconfirm,
} from "antd";
import { UserOutlined, DollarOutlined, CheckOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styled from "styled-components";
import moment from "moment";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Styled Components
const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff, #f9fafb);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #1890ff;
    color: white;
    font-weight: 600;
    border-bottom: 2px solid #e8ecef;
  }
  .ant-table-row {
    transition: background 0.2s ease;
    &:hover {
      background: #e6f7ff;
    }
  }
`;

const StyledButton = styled(Button)`
  border-radius: 8px;
  padding: 6px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const ManageStaffPayments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { attendanceRecords, salaryRecords, loading: staffLoading, error: staffError } = useSelector((state) => state.staffManagement);
  const { users, loading: userLoading, error: userError } = useSelector((state) => state.user); // Access users from userSlice
  const { user: authUser } = useSelector((state) => state.auth);

  const [attendanceForm] = Form.useForm();
  const [salaryForm] = Form.useForm();
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter staff from users (excluding admins)
  const staffList = users.filter(user => user.role === "staff" || user.role === "kitchen_staff");

  useEffect(() => {
    if (authUser?.role !== "admin") {
      navigate("/dashboard"); // Redirect non-admins
      return;
    }

    // Fetch all users (staff list)
    dispatch(fetchAllUsers()).catch((err) => {
      notification.error({
        message: "Error",
        description: err.message || "Failed to fetch staff list",
        placement: "topRight",
      });
    });

    const params = {
      startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
      endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      page: currentPage,
      limit: pageSize,
    };
    dispatch(getAttendanceRecords(params));
    dispatch(getSalaryRecords(params));
  }, [dispatch, dateRange, currentPage, pageSize, authUser, navigate]);

  const handleMarkAttendance = async (values) => {
    try {
      await dispatch(markAttendance(values)).unwrap();
      notification.success({
        message: "Success",
        description: "Attendance marked successfully!",
        placement: "topRight",
      });
      setAttendanceModalVisible(false);
      attendanceForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to mark attendance",
        placement: "topRight",
      });
    }
  };

  const handleCreateSalaryRecord = async (values) => {
    try {
      await dispatch(createSalaryRecord(values)).unwrap();
      notification.success({
        message: "Success",
        description: "Salary record created successfully!",
        placement: "topRight",
      });
      setSalaryModalVisible(false);
      salaryForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to create salary record",
        placement: "topRight",
      });
    }
  };

  const handleMarkSalaryPaid = async (salaryRecordId) => {
    try {
      await dispatch(markSalaryPaid(salaryRecordId)).unwrap();
      notification.success({
        message: "Success",
        description: "Salary marked as paid!",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to mark salary as paid",
        placement: "topRight",
      });
    }
  };

  const attendanceColumns = [
    { title: "Staff Name", dataIndex: ["user", "name"], key: "name" },
    { title: "Date", dataIndex: "date", key: "date", render: (date) => moment(date).format("YYYY-MM-DD") },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Check In", dataIndex: "checkIn", key: "checkIn", render: (time) => time ? moment(time).format("HH:mm") : "N/A" },
    { title: "Check Out", dataIndex: "checkOut", key: "checkOut", render: (time) => time ? moment(time).format("HH:mm") : "N/A" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
  ];

  const salaryColumns = [
    { title: "Staff Name", dataIndex: ["user", "name"], key: "name" },
    { title: "Month", dataIndex: "month", key: "month" },
    { title: "Base Salary", dataIndex: "baseSalary", key: "baseSalary", render: (val) => `$${val.toFixed(2)}` },
    { title: "Total Salary", dataIndex: "totalSalary", key: "totalSalary", render: (val) => `$${val.toFixed(2)}` },
    { title: "Paid", dataIndex: "isPaid", key: "isPaid", render: (paid) => (paid ? "Yes" : "No") },
    { 
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        !record.isPaid && (
          <Popconfirm
            title="Mark this salary as paid?"
            onConfirm={() => handleMarkSalaryPaid(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <StyledButton type="link" icon={<CheckOutlined />} style={{ color: "#1890ff" }}>
              Mark Paid
            </StyledButton>
          </Popconfirm>
        )
      ),
    },
  ];

  if ((staffLoading || userLoading) && !attendanceRecords.length && !salaryRecords.length) {
    return <Spin size="large" tip="Loading staff data..." fullscreen />;
  }

  if (staffError || userError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
      >
        <StyledCard>
          <p style={{ color: "#ff4d4f", fontSize: "18px", marginBottom: "16px" }}>
            {staffError || userError}
          </p>
          <StyledButton type="primary" onClick={() => window.location.reload()}>
            Retry
          </StyledButton>
          <StyledButton style={{ marginLeft: "16px" }} onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </StyledButton>
        </StyledCard>
      </motion.div>
    );
  }

  return (
    <Fragment>
      <div className="min-h-screen flex bg-gradient-to-b from-gray-50 to-gray-100">
        <FloatingSidebar  />
        <motion.div
          className={`content w-full p-6 sm:p-8 transition-all duration-300`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Content style={{ padding: "24px", background: "transparent" }}>
            <motion.div
              className="header-div flex items-center gap-3 mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <UserOutlined className="text-4xl text-blue-600" />
              <Title level={2} style={{ color: "#1d3557", margin: 0 }}>
                Manage Staff
              </Title>
            </motion.div>

            {/* Mark Attendance Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StyledCard style={{ marginBottom: "32px" }}>
                <Title level={4} style={{ color: "#2d3748", marginBottom: "24px" }}>
                  Mark Attendance
                </Title>
                <Button
                  type="primary"
                  onClick={() => setAttendanceModalVisible(true)}
                  style={{ marginBottom: "16px" }}
                >
                  Mark New Attendance
                </Button>
                <StyledTable
                  columns={attendanceColumns}
                  dataSource={attendanceRecords}
                  rowKey="_id"
                  pagination={{ current: currentPage, pageSize, onChange: setCurrentPage }}
                />
              </StyledCard>
            </motion.div>

            {/* Create Salary Record Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StyledCard>
                <Title level={4} style={{ color: "#2d3748", marginBottom: "24px" }}>
                  Manage Salaries
                </Title>
                <Button
                  type="primary"
                  onClick={() => setSalaryModalVisible(true)}
                  style={{ marginBottom: "16px" }}
                >
                  Create Salary Record
                </Button>
                <StyledTable
                  columns={salaryColumns}
                  dataSource={salaryRecords}
                  rowKey="_id"
                  pagination={{ current: currentPage, pageSize, onChange: setCurrentPage }}
                />
              </StyledCard>
            </motion.div>

            {/* Attendance Modal */}
            <Modal
              title="Mark Attendance"
              open={attendanceModalVisible}
              onCancel={() => setAttendanceModalVisible(false)}
              footer={null}
            >
              <Form
                form={attendanceForm}
                layout="vertical"
                onFinish={handleMarkAttendance}
              >
                <Form.Item
                  label="Staff Member"
                  name="userId"
                  rules={[{ required: true, message: "Please select a staff member" }]}
                >
                  <Select placeholder="Select staff">
                    {staffList.map((staff) => (
                      <Option key={staff._id} value={staff._id}>
                        {staff.name} ({staff.role})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select a status" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="present">Present</Option>
                    <Option value="absent">Absent</Option>
                    <Option value="leave">Leave</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Check In" name="checkIn">
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                </Form.Item>
                <Form.Item label="Check Out" name="checkOut">
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                </Form.Item>
                <Form.Item label="Notes" name="notes">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item>
                  <StyledButton type="primary" htmlType="submit" loading={staffLoading}>
                    Mark Attendance
                  </StyledButton>
                </Form.Item>
              </Form>
            </Modal>

            {/* Salary Modal */}
            <Modal
              title="Create Salary Record"
              open={salaryModalVisible}
              onCancel={() => setSalaryModalVisible(false)}
              footer={null}
            >
              <Form
                form={salaryForm}
                layout="vertical"
                onFinish={handleCreateSalaryRecord}
              >
                <Form.Item
                  label="Staff Member"
                  name="userId"
                  rules={[{ required: true, message: "Please select a staff member" }]}
                >
                  <Select placeholder="Select staff">
                    {staffList.map((staff) => (
                      <Option key={staff._id} value={staff._id}>
                        {staff.name} ({staff.role})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Month"
                  name="month"
                  rules={[{ required: true, message: "Please select a month" }]}
                >
                  <DatePicker.MonthPicker format="YYYY-MM" />
                </Form.Item>
                <Form.List name="adjustments">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey }) => (
                        <Row gutter={16} key={key}>
                          <Col span={8}>
                            <Form.Item
                              name={[name, "type"]}
                              fieldKey={[fieldKey, "type"]}
                              rules={[{ required: true, message: "Type is required" }]}
                            >
                              <Select placeholder="Type">
                                <Option value="deduction">Deduction</Option>
                                <Option value="bonus">Bonus</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name={[name, "amount"]}
                              fieldKey={[fieldKey, "amount"]}
                              rules={[{ required: true, message: "Amount is required" }]}
                            >
                              <InputNumber min={0} placeholder="Amount" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name={[name, "reason"]}
                              fieldKey={[fieldKey, "reason"]}
                              rules={[{ required: true, message: "Reason is required" }]}
                            >
                              <Input placeholder="Reason" />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Button onClick={() => remove(name)}>Remove</Button>
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          Add Adjustment
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item label="Notes" name="notes">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item>
                  <StyledButton type="primary" htmlType="submit" loading={staffLoading}>
                    Create Salary Record
                  </StyledButton>
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </motion.div>
      </div>
    </Fragment>
  );
};


export default ManageStaffPayments;