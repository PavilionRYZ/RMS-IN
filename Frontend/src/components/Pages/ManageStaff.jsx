import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers, registerUser, updateUser, deleteUser } from "../Redux/Slices/userSlice";
import FloatingSidebar from "../Layout/FloatingSidebar";
import {
  Table,
  Form,
  Input,
  Select,
  Button,
  Modal,
  Spin,
  Popconfirm,
  notification,
  Layout,
  Typography,
  Row,
  Col,
  Card,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { MdManageAccounts } from "react-icons/md";
import { motion } from "framer-motion";
import styled from "styled-components";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Styled components for custom styling
const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #ffffff, #f9f9f9);
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #1890ff;
    color: white;
    font-weight: 600;
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
  padding: 6px 16px;
  font-weight: 500;
`;

const ManageStaff = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.user);

  const [registerForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const availablePermissions = [
    "inventory_management",
    "manage_orders",
    "manage_menu",
    "manage_staff",
    "manage_payments",
  ];

  useEffect(() => {
    dispatch(fetchAllUsers())
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Error",
          description: err,
          placement: "topRight",
        });
      });
  }, [dispatch]);

  const handleRegisterUser = async (values) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      notification.success({
        message: "Success",
        description: "User registered successfully!",
        placement: "topRight",
      });
      registerForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err,
        placement: "topRight",
      });
    }
  };

  const handleOpenUpdateModal = (user) => {
    setSelectedUser(user);
    updateForm.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      salary: user.salary,
      duty_time: user.duty_time,
      permissions: user.permissions,
      address: user.address,
      phone: user.phone,
      image: user.image,
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateUserSubmit = async (values) => {
    try {
      await dispatch(updateUser({ userId: selectedUser._id, ...values })).unwrap();
      notification.success({
        message: "Success",
        description: "User updated successfully!",
        placement: "topRight",
      });
      setUpdateModalVisible(false);
      setSelectedUser(null);
    } catch (err) {
      notification.error({
        message: "Error",
        description: err,
        placement: "topRight",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      notification.success({
        message: "Success",
        description: "User deleted successfully!",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Error",
        description: err,
        placement: "topRight",
      });
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Salary", dataIndex: "salary", key: "salary" },
    { title: "Duty Time", dataIndex: "duty_time", key: "duty_time" },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => permissions.join(", "),
    },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          <StyledButton
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenUpdateModal(record)}
            style={{ color: "#1890ff" }}
          >
            Update
          </StyledButton>
          <Popconfirm
            title={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <StyledButton type="link" danger icon={<DeleteOutlined />}>
              Delete
            </StyledButton>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Loading users..." />
      </div>
    );
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
          <StyledButton type="primary" onClick={() => dispatch(fetchAllUsers())}>
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
      <div className="main-div flex">
        <FloatingSidebar />
        <motion.div
          className={`content w-full p-6 transition-all duration-300`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Content style={{ padding: "24px", background: "#f0f2f5" }}>
            <motion.div
              className="header-div margin flex items-center gap-2 mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MdManageAccounts className="text-4xl text-blue-500" />
              <Title level={2} style={{ color: "#1d3557", margin: 0 }}>
                Manage Staff
              </Title>
            </motion.div>

            {/* Register New User Form */}
            <StyledCard style={{ marginBottom: "24px" }}>
              <Title level={4} style={{ color: "#2d3748" }}>
                Register New User
              </Title>
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegisterUser}
                initialValues={{ role: "staff", salary: 0, permissions: [] }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[{ required: true, message: "Please enter the name" }]}
                    >
                      <Input placeholder="Enter name" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Please enter the email" },
                        { type: "email", message: "Please enter a valid email" },
                      ]}
                    >
                      <Input placeholder="Enter email" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        { required: true, message: "Please enter the password" },
                        { min: 4, message: "Password must be at least 4 characters" },
                      ]}
                    >
                      <Input.Password placeholder="Enter password" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Role"
                      name="role"
                      rules={[{ required: true, message: "Please select a role" }]}
                    >
                      <Select placeholder="Select role" style={{ borderRadius: "6px" }}>
                        <Option value="staff">Staff</Option>
                        <Option value="kitchen_staff">Kitchen Staff</Option>
                        <Option value="admin">Admin</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Salary"
                      name="salary"
                      rules={[{ required: true, message: "Please enter the salary" }]}
                    >
                      <Input type="number" min={0} placeholder="Enter salary" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Duty Time"
                      name="duty_time"
                      rules={[{ required: true, message: "Please enter the duty time" }]}
                    >
                      <Input placeholder="e.g., 9:00 AM - 5:00 PM" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Permissions" name="permissions">
                      <Select mode="multiple" placeholder="Select permissions" style={{ borderRadius: "6px" }}>
                        {availablePermissions.map((permission) => (
                          <Option key={permission} value={permission}>
                            {permission.replace("manage_", "").replace("_", " ").toUpperCase()}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[{ required: true, message: "Please enter the address" }]}
                    >
                      <Input placeholder="Enter address" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: "Please enter the phone number" }]}
                    >
                      <Input placeholder="Enter phone number" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Image URL" name="image">
                      <Input placeholder="Enter image URL (optional)" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item>
                      <StyledButton
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        loading={loading}
                        style={{ background: "#1890ff", borderColor: "#1890ff" }}
                      >
                        Register User
                      </StyledButton>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </StyledCard>

            {/* List of Users */}
            <StyledCard>
              <Title level={4} style={{ color: "#2d3748" }}>
                All Users
              </Title>
              <StyledTable
                columns={columns}
                dataSource={users}
                rowKey="_id"
                locale={{ emptyText: "No users found." }}
                scroll={{ x: true }}
                pagination={{ pageSize: 10 }}
              />
            </StyledCard>

            {/* Update User Modal */}
            <Modal
              title="Update User"
              open={updateModalVisible}
              onCancel={() => setUpdateModalVisible(false)}
              footer={null}
              style={{ top: 20 }}
              bodyStyle={{ padding: "24px", background: "#f9f9f9", borderRadius: "8px" }}
            >
              <Form form={updateForm} layout="vertical" onFinish={handleUpdateUserSubmit}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[{ required: true, message: "Please enter the name" }]}
                    >
                      <Input placeholder="Enter name" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Please enter the email" },
                        { type: "email", message: "Please enter a valid email" },
                      ]}
                    >
                      <Input placeholder="Enter email" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Role"
                      name="role"
                      rules={[{ required: true, message: "Please select a role" }]}
                    >
                      <Select placeholder="Select role" style={{ borderRadius: "6px" }}>
                        <Option value="staff">Staff</Option>
                        <Option value="kitchen_staff">Kitchen Staff</Option>
                        <Option value="admin">Admin</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Salary"
                      name="salary"
                      rules={[{ required: true, message: "Please enter the salary" }]}
                    >
                      <Input type="number" min={0} placeholder="Enter salary" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Duty Time"
                      name="duty_time"
                      rules={[{ required: true, message: "Please enter the duty time" }]}
                    >
                      <Input placeholder="e.g., 9:00 AM - 5:00 PM" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Permissions" name="permissions">
                      <Select mode="multiple" placeholder="Select permissions" style={{ borderRadius: "6px" }}>
                        {availablePermissions.map((permission) => (
                          <Option key={permission} value={permission}>
                            {permission.replace("manage_", "").replace("_", " ").toUpperCase()}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[{ required: true, message: "Please enter the address" }]}
                    >
                      <Input placeholder="Enter address" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: "Please enter the phone number" }]}
                    >
                      <Input placeholder="Enter phone number" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Image URL" name="image">
                      <Input placeholder="Enter image URL (optional)" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item>
                      <StyledButton
                        type="primary"
                        htmlType="submit"
                        icon={<EditOutlined />}
                        loading={loading}
                        style={{ marginRight: "8px", background: "#1890ff", borderColor: "#1890ff" }}
                      >
                        Update
                      </StyledButton>
                      <StyledButton onClick={() => setUpdateModalVisible(false)}>
                        Cancel
                      </StyledButton>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </Content>
        </motion.div>
      </div>
    </Fragment>
  );
};

ManageStaff.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default ManageStaff;
