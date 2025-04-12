import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createReservation,
  updateReservation,
  cancelReservation,
  getAllReservations,
  getReservationsByCustomerName,
} from "../Redux/Slices/reservationSlice";
import FloatingSidebar from "../Layout/FloatingSidebar";
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Modal,
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
import { TableOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import styled from "styled-components";
import moment from "moment";
import Loading from "../Loading/Loading";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

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

const ManageReservations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Safely handle undefined reservations with a default empty array
  const { reservations = [], loading, error } = useSelector((state) => state.reservation || { reservations: [] });
  const { user: authUser } = useSelector((state) => state.auth);

  const [reservationForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchDate, setSearchDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (authUser?.role !== "admin" && authUser?.permissions !== "manage_reservations") {
      navigate("/not-authorized");
      return;
    }

    const params = {};
    if (searchCustomerName) params.customerName = searchCustomerName;
    if (searchStatus) params.status = searchStatus;
    if (searchDate) params.date = searchDate.format("YYYY-MM-DD");

    if (authUser.role === "admin") {
      dispatch(getAllReservations(params));
    } else if (searchCustomerName) {
      dispatch(getReservationsByCustomerName(params));
    }
  }, [dispatch, authUser, navigate, searchCustomerName, searchStatus, searchDate]);

  const handleCreateReservation = async (values) => {
    try {
      await dispatch(createReservation(values)).unwrap();
      notification.success({
        message: "Success",
        description: "Reservation created successfully!",
        placement: "topRight",
      });
      setCreateModalVisible(false);
      reservationForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err || "Failed to create reservation",
        placement: "topRight",
      });
    }
  };

  const handleUpdateReservation = async (values) => {
    try {
      await dispatch(updateReservation({ reservationId: selectedReservation._id, updateData: values })).unwrap();
      notification.success({
        message: "Success",
        description: "Reservation updated successfully!",
        placement: "topRight",
      });
      setUpdateModalVisible(false);
      updateForm.resetFields();
      setSelectedReservation(null);
    } catch (err) {
      notification.error({
        message: "Error",
        description: err || "Failed to update reservation",
        placement: "topRight",
      });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await dispatch(cancelReservation(reservationId)).unwrap();
      notification.success({
        message: "Success",
        description: "Reservation canceled successfully!",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Error",
        description: err || "Failed to cancel reservation",
        placement: "topRight",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#faad14"; // Orange
      case "confirmed":
        return "#52c41a"; // Green
      case "seated":
        return "#1890ff"; // Blue
      case "completed":
        return "#13c2c2"; // Cyan
      case "canceled":
        return "#ff4d4f"; // Red
      default:
        return "#000000"; // Black (fallback)
    }
  };

  const columns = [
    { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
    { title: "Table Number", dataIndex: "tableNumber", key: "tableNumber" },
    {
      title: "Date & Time",
      dataIndex: "reservationDate",
      key: "reservationDate",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
    },
    { title: "Party Size", dataIndex: "partySize", key: "partySize" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: getStatusColor(status), fontWeight: "bold" }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    { title: "Special Requests", dataIndex: "specialRequests", key: "specialRequests" },
    {
      title: "Created By",
      dataIndex: ["createdBy", "name"],
      key: "createdBy",
      render: (name) => name || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          <StyledButton
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedReservation(record);
              updateForm.setFieldsValue({
                customerName: record.customerName,
                tableNumber: record.tableNumber,
                reservationDate: moment(record.reservationDate),
                partySize: record.partySize,
                status: record.status,
                specialRequests: record.specialRequests,
              });
              setUpdateModalVisible(true);
            }}
          >
            Edit
          </StyledButton>
          {record.status !== "canceled" && (
            <Popconfirm
              title="Are you sure you want to cancel this reservation?"
              onConfirm={() => handleCancelReservation(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <StyledButton type="link" danger icon={<DeleteOutlined />}>
                Cancel
              </StyledButton>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  // Fix loading check to handle undefined reservations
  if (loading && (!reservations || reservations.length === 0)) {
    return <Loading />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
      >
        <StyledCard>
          <p style={{ color: "#ff4d4f", fontSize: "18px", marginBottom: "16px" }}>{error}</p>
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
        <FloatingSidebar />
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
              <TableOutlined className="text-4xl text-blue-600" />
              <Title level={2} style={{ color: "#1d3557", margin: 0 }}>
                Manage Reservations
              </Title>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StyledCard>
                <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
                  <Col>
                    <Title level={4} style={{ color: "#2d3748", margin: 0 }}>
                      Reservations
                    </Title>
                  </Col>
                  <Col>
                    <StyledButton type="primary" onClick={() => setCreateModalVisible(true)}>
                      Create Reservation
                    </StyledButton>
                  </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                  <Col xs={24} sm={12} md={8}>
                    <Input
                      placeholder="Search by customer name"
                      value={searchCustomerName}
                      onChange={(e) => setSearchCustomerName(e.target.value)}
                      allowClear
                    />
                  </Col>
                  {authUser.role === "admin" && (
                    <>
                      <Col xs={24} sm={12} md={8}>
                        <Select
                          placeholder="Filter by status"
                          value={searchStatus}
                          onChange={(value) => setSearchStatus(value)}
                          allowClear
                          style={{ width: "100%" }}
                        >
                          <Option value="pending">Pending</Option>
                          <Option value="confirmed">Confirmed</Option>
                          <Option value="seated">Seated</Option>
                          <Option value="completed">Completed</Option>
                          <Option value="canceled">Canceled</Option>
                        </Select>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <DatePicker
                          placeholder="Filter by date"
                          value={searchDate}
                          onChange={(date) => setSearchDate(date)}
                          format="YYYY-MM-DD"
                          style={{ width: "100%" }}
                        />
                      </Col>
                    </>
                  )}
                </Row>
                <StyledTable
                  columns={columns}
                  dataSource={reservations}
                  rowKey="_id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: reservations.length, // Safe now due to default value
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setPageSize(pageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                  }}
                />
              </StyledCard>
            </motion.div>

            {/* Create Reservation Modal */}
            <Modal
              title="Create Reservation"
              open={createModalVisible}
              onCancel={() => setCreateModalVisible(false)}
              footer={null}
            >
              <Form
                form={reservationForm}
                layout="vertical"
                onFinish={handleCreateReservation}
              >
                <Form.Item
                  label="Customer Name"
                  name="customerName"
                  rules={[{ required: true, message: "Please enter the customer name" }]}
                >
                  <Input placeholder="Enter customer name" />
                </Form.Item>
                <Form.Item
                  label="Table Number"
                  name="tableNumber"
                  rules={[{ required: true, message: "Please enter a table number" }]}
                >
                  <InputNumber min={1} placeholder="Table number" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="Reservation Date & Time"
                  name="reservationDate"
                  rules={[{ required: true, message: "Please select a date and time" }]}
                >
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                </Form.Item>
                <Form.Item
                  label="Party Size"
                  name="partySize"
                  rules={[{ required: true, message: "Please enter the party size" }]}
                >
                  <InputNumber min={1} placeholder="Party size" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Special Requests" name="specialRequests">
                  <Input.TextArea rows={3} placeholder="Any special requests" />
                </Form.Item>
                <Form.Item>
                  <StyledButton type="primary" htmlType="submit" loading={loading}>
                    Create Reservation
                  </StyledButton>
                </Form.Item>
              </Form>
            </Modal>

            {/* Update Reservation Modal */}
            <Modal
              title="Update Reservation"
              open={updateModalVisible}
              onCancel={() => {
                setUpdateModalVisible(false);
                setSelectedReservation(null);
              }}
              footer={null}
            >
              <Form
                form={updateForm}
                layout="vertical"
                onFinish={handleUpdateReservation}
              >
                <Form.Item
                  label="Customer Name"
                  name="customerName"
                  rules={[{ required: true, message: "Please enter the customer name" }]}
                >
                  <Input placeholder="Enter customer name" />
                </Form.Item>
                <Form.Item
                  label="Table Number"
                  name="tableNumber"
                  rules={[{ required: true, message: "Please enter a table number" }]}
                >
                  <InputNumber min={1} placeholder="Table number" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="Reservation Date & Time"
                  name="reservationDate"
                  rules={[{ required: true, message: "Please select a date and time" }]}
                >
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                </Form.Item>
                <Form.Item
                  label="Party Size"
                  name="partySize"
                  rules={[{ required: true, message: "Please enter the party size" }]}
                >
                  <InputNumber min={1} placeholder="Party size" style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select a status" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="pending">Pending</Option>
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="seated">Seated</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="canceled">Canceled</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Special Requests" name="specialRequests">
                  <Input.TextArea rows={3} placeholder="Any special requests" />
                </Form.Item>
                <Form.Item>
                  <StyledButton type="primary" htmlType="submit" loading={loading}>
                    Update Reservation
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

export default ManageReservations;