import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers, registerUser, updateUser, deleteUser } from "../Redux/Slices/userSlice";
import Sidebar from "../Layout/Sidebar"; // Assuming Sidebar is a custom component
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
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { MdManageAccounts } from "react-icons/md";
const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ManageStaff = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.user);

  // Form instances for Ant Design Form
  const [registerForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  // State for updating a user
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Available permissions
  const availablePermissions = ["manage_inventory", "manage_orders", "manage_menu", "manage_staff","manage_payments"];

  // Fetch all users on component mount
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

  // Handle new user registration
  const handleRegisterUser = async (values) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      notification.success({
        message: "Success",
        description: "User registered successfully!",
        placement: "topRight",
      });
      registerForm.resetFields(); // Reset form
    } catch (err) {
      notification.error({
        message: "Error",
        description: err,
        placement: "topRight",
      });
    }
  };

  // Handle opening the update modal
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

  // Handle user update
  const handleUpdateUserSubmit = async (values) => {
    try {
      await dispatch(
        updateUser({
          userId: selectedUser._id,
          ...values,
        })
      ).unwrap();
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

  // Handle user deletion
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

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
    },
    {
      title: "Duty Time",
      dataIndex: "duty_time",
      key: "duty_time",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions) => permissions.join(", "),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenUpdateModal(record)}
          >
            Update
          </Button>
          <Popconfirm
            title={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Loading users..." fullscreen />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "red", fontSize: "18px", marginBottom: "16px" }}>{error}</p>
          <Button type="primary" onClick={() => dispatch(fetchAllUsers())}>
            Retry
          </Button>
          <Button style={{ marginLeft: "16px" }} onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="main-div">
        <Sidebar   isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}/> {/* Assuming Sidebar is a custom Ant Design compatible component */}
           <div  className={`content w-full p-6 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`} >
          <Content style={{ padding: "24px", background: "#fff" }}>
          <div className="header-div flex items-center gap-2 mb-4">
             <MdManageAccounts className="text-4xl" />
            <Title className="text-xl font-semibold">Manage Staff</Title>
          </div>

            {/* Register New User Form */}
            <div style={{ marginBottom: "24px", padding: "24px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}>
              <Title level={4}>Register New User</Title>
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegisterUser}
                initialValues={{
                  role: "staff",
                  salary: 0,
                  permissions: [],
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[{ required: true, message: "Please enter the name" }]}
                    >
                      <Input placeholder="Enter name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, message: "Please enter the email" }, { type: "email", message: "Please enter a valid email" }]}
                    >
                      <Input placeholder="Enter email" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[{ required: true, message: "Please enter the password" }, { min: 4, message: "Password must be at least 4 characters" }]}
                    >
                      <Input.Password placeholder="Enter password" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Role"
                      name="role"
                      rules={[{ required: true, message: "Please select a role" }]}
                    >
                      <Select placeholder="Select role">
                        <Option value="staff">Staff</Option>
                        <Option value="kitchen_staff">Kitchen Staff</Option>
                        <Option value="admin">Admin</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Salary"
                      name="salary"
                      rules={[{ required: true, message: "Please enter the salary" }]}
                    >
                      <Input type="number" min={0} placeholder="Enter salary" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Duty Time"
                      name="duty_time"
                      rules={[{ required: true, message: "Please enter the duty time" }]}
                    >
                      <Input placeholder="e.g., 9:00 AM - 5:00 PM" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Permissions" name="permissions">
                      <Select mode="multiple" placeholder="Select permissions">
                        {availablePermissions.map((permission) => (
                          <Option key={permission} value={permission}>
                            {permission.replace("manage_", "").replace("_", " ").toUpperCase()}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[{ required: true, message: "Please enter the address" }]}
                    >
                      <Input placeholder="Enter address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: "Please enter the phone number" }]}
                    >
                      <Input placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Image URL" name="image">
                      <Input placeholder="Enter image URL (optional)" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loading}>
                        Register User
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>

            {/* List of Users */}
            <div style={{ padding: "24px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}>
              <Title level={4}>All Users</Title>
              <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                locale={{ emptyText: "No users found." }}
                scroll={{ x: true }}
              />
            </div>

            {/* Update User Modal */}
            <Modal
              title="Update User"
              open={updateModalVisible}
              onCancel={() => setUpdateModalVisible(false)}
              footer={null}
            >
              <Form
                form={updateForm}
                layout="vertical"
                onFinish={handleUpdateUserSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[{ required: true, message: "Please enter the name" }]}
                    >
                      <Input placeholder="Enter name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, message: "Please enter the email" }, { type: "email", message: "Please enter a valid email" }]}
                    >
                      <Input placeholder="Enter email" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Role"
                      name="role"
                      rules={[{ required: true, message: "Please select a role" }]}
                    >
                      <Select placeholder="Select role">
                        <Option value="staff">Staff</Option>
                        <Option value="kitchen_staff">Kitchen Staff</Option>
                        <Option value="admin">Admin</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Salary"
                      name="salary"
                      rules={[{ required: true, message: "Please enter the salary" }]}
                    >
                      <Input type="number" min={0} placeholder="Enter salary" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Duty Time"
                      name="duty_time"
                      rules={[{ required: true, message: "Please enter the duty time" }]}
                    >
                      <Input placeholder="e.g., 9:00 AM - 5:00 PM" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Permissions" name="permissions">
                      <Select mode="multiple" placeholder="Select permissions">
                        {availablePermissions.map((permission) => (
                          <Option key={permission} value={permission}>
                            {permission.replace("manage_", "").replace("_", " ").toUpperCase()}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[{ required: true, message: "Please enter the address" }]}
                    >
                      <Input placeholder="Enter address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: "Please enter the phone number" }]}
                    >
                      <Input placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Image URL" name="image">
                      <Input placeholder="Enter image URL (optional)" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<EditOutlined />} loading={loading} style={{ marginRight: "8px" }}>
                        Update
                      </Button>
                      <Button onClick={() => setUpdateModalVisible(false)}>
                        Cancel
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </Content>
          </div>
      </div>
    </Fragment>
  );
};

ManageStaff.propTypes = {
    isSidebarOpen: PropTypes.bool.isRequired,
    setIsSidebarOpen: PropTypes.func.isRequired,
};

export default ManageStaff;