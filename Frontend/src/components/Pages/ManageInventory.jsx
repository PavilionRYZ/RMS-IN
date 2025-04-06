/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getInventoryItems,
  addStock,
  stockUse,
  deleteInventoryItem,
  getInventoryItemDetails,
  createInventoryItem,
} from "../Redux/Slices/inventorySlice";
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
  DatePicker,
  InputNumber,
  Descriptions,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { FaBoxOpen } from "react-icons/fa";
import { motion } from "framer-motion";
import styled from "styled-components";
import moment from "moment";
import { PlusCircleOutlined } from "@ant-design/icons"; 

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Styled components for custom styling
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
    background: #52c41a;
    color: white;
    font-weight: 600;
    border-bottom: 2px solid #e8ecef;
  }
  .ant-table-row {
    transition: background 0.2s ease;
   
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

const ManageInventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventory, inventoryItem, loading, error } = useSelector((state) => state.inventory);
  const [createForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [useForm] = Form.useForm();
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [useStockModalVisible, setUseStockModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const units = ["kg", "gram", "litre", "millilitre", "piece", "pack"];

  useEffect(() => {
    const params = {
      search: searchTerm,
      startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
      endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize,
    };
    dispatch(getInventoryItems(params))
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Error",
          description: err.message || "Failed to fetch inventory items",
          placement: "topRight",
        });
      });
  }, [dispatch, searchTerm, dateRange, sortBy, sortOrder, currentPage, pageSize]);

  const handleCreateInventoryItem = async (values) => {
    try {
      await dispatch(createInventoryItem(values)).unwrap();
      notification.success({
        message: "Success",
        description: "New inventory item created successfully!",
        placement: "topRight",
      });
      createForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to create inventory item",
        placement: "topRight",
      });
    }
  };
  const handleAddStock = async (values) => {
    try {
      await dispatch(addStock(values)).unwrap();
      notification.success({
        message: "Success",
        description: "Stock added successfully!",
        placement: "topRight",
      });
      addForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to add stock",
        placement: "topRight",
      });
    }
  };

  const handleUseStock = async (values) => {
    try {
      await dispatch(stockUse({ item_name: selectedItem.item_name, ...values })).unwrap();
      notification.success({
        message: "Success",
        description: "Stock used successfully!",
        placement: "topRight",
      });
      setUseStockModalVisible(false);
      useForm.resetFields();
      setSelectedItem(null);
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to use stock",
        placement: "topRight",
      });
    }
  };

  const handleOpenDetailsModal = (item) => {
    dispatch(getInventoryItemDetails(item._id))
      .unwrap()
      .then(() => setDetailsModalVisible(true))
      .catch((err) => {
        notification.error({
          message: "Error",
          description: err.message || "Failed to fetch item details",
          placement: "topRight",
        });
      });
  };

  const handleOpenUseStockModal = (item) => {
    setSelectedItem(item);
    useForm.setFieldsValue({ quantity: 0 });
    setUseStockModalVisible(true);
  };

  const handleDeleteInventoryItem = async (itemId) => {
    try {
      await dispatch(deleteInventoryItem(itemId)).unwrap();
      notification.success({
        message: "Success",
        description: "Inventory item deleted successfully!",
        placement: "topRight",
      });
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to delete inventory item",
        placement: "topRight",
      });
    }
  };

  const columns = [
    {
      title: "Item Name",
      dataIndex: "item_name",
      key: "item_name",
      sorter: (a, b) => a.item_name.localeCompare(b.item_name),
    },
    {
      title: "Current Quantity",
      dataIndex: "current_quantity",
      key: "current_quantity",
      sorter: (a, b) => a.current_quantity - b.current_quantity,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Avg Unit Price",
      dataIndex: "average_unit_price",
      key: "average_unit_price",
      render: (price) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.average_unit_price - b.average_unit_price,
    },
    {
      title: "Total Value",
      dataIndex: "total_value",
      key: "total_value",
      render: (total) => `$${total.toFixed(2)}`,
      sorter: (a, b) => a.total_value - b.total_value,
    },
    {
      title: "Last Updated",
      dataIndex: "last_updated",
      key: "last_updated",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => new Date(a.last_updated) - new Date(b.last_updated),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <StyledButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenDetailsModal(record)}
              style={{ color: "#52c41a" }}
            >
              Details
            </StyledButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <StyledButton
              type="link"
              icon={<MinusOutlined />}
              onClick={() => handleOpenUseStockModal(record)}
              style={{ color: "#1890ff" }}
            >
              Use
            </StyledButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Popconfirm
              title={`Are you sure you want to delete ${record.item_name}?`}
              onConfirm={() => handleDeleteInventoryItem(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <StyledButton type="link" danger icon={<DeleteOutlined />}>
                Delete
              </StyledButton>
            </Popconfirm>
          </motion.div>
        </div>
      ),
    },
  ];

  if (loading && !inventory.inventoryItems.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Loading inventory items..." fullscreen />
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
          <p style={{ color: "#ff4d4f", fontSize: "18px", marginBottom: "16px" }}>{error.message}</p>
          <StyledButton type="primary" onClick={() => dispatch(getInventoryItems())}>
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
        <FloatingSidebar/>
        <motion.div
          className={`content w-full p-6 sm:p-8 transition-all duration-300`}
          style={{display: 'flex', flexDirection: 'column', gap:"1rem"}}
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
              <FaBoxOpen className="text-4xl text-green-600" />
              <Title level={2} style={{ color: "#1d3557", margin: 0 }}>
                Manage Inventory
              </Title>
            </motion.div>

            {/* New Inventory Item Form */}
            <motion.div
              className="margin-t"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StyledCard style={{ marginBottom: "32px" }}>
                <Title level={4} style={{ color: "#2d3748", marginBottom: "24px" }}>
                  Create New Inventory Item
                </Title>
                <Form
                  form={createForm}
                  layout="vertical"
                  onFinish={handleCreateInventoryItem}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Item Name"
                        name="item_name"
                        rules={[{ required: true, message: "Please enter the item name" }]}
                      >
                        <Input
                          placeholder="Enter item name"
                          className="rounded-lg p-3 border-gray-200 focus:ring-2 focus:ring-green-400"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Unit"
                        name="unit"
                        rules={[{ required: true, message: "Please select a unit" }]}
                      >
                        <Select
                          placeholder="Select unit"
                          className="rounded-lg"
                          dropdownStyle={{ borderRadius: "8px" }}
                        >
                          {units.map((unit) => (
                            <Option key={unit} value={unit}>
                              {unit}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <StyledButton
                            type="primary"
                            htmlType="submit"
                            icon={<PlusCircleOutlined />}
                            loading={loading}
                            style={{ background: "#722ed1", borderColor: "#722ed1" }}
                          >
                            Create Item
                          </StyledButton>
                        </motion.div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </StyledCard>
            </motion.div>
            {/* Add New Stock Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StyledCard style={{ marginBottom: "32px" }}>
                <Title level={4} style={{ color: "#2d3748", marginBottom: "24px" }}>
                  Add New Stock
                </Title>
                <Form
                  form={addForm}
                  layout="vertical"
                  onFinish={handleAddStock}
                  initialValues={{ quantity: 0, unit_price: 0 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Item Name"
                        name="item_name"
                        rules={[{ required: true, message: "Please enter the item name" }]}
                      >
                        <Input
                          placeholder="Enter item name"
                          className="rounded-lg p-3 border-gray-200 focus:ring-2 focus:ring-green-400"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Unit"
                        name="unit"
                        rules={[{ required: true, message: "Please select a unit" }]}
                      >
                        <Select
                          placeholder="Select unit"
                          className="rounded-lg"
                          dropdownStyle={{ borderRadius: "8px" }}
                        >
                          {units.map((unit) => (
                            <Option key={unit} value={unit}>
                              {unit}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Quantity"
                        name="quantity"
                        rules={[{ required: true, message: "Please enter the quantity" }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Enter quantity"
                          className="rounded-lg w-full p-3 border-gray-200 focus:ring-2 focus:ring-green-400"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Unit Price ($)"
                        name="unit_price"
                        rules={[{ required: true, message: "Please enter the unit price" }]}
                      >
                        <InputNumber
                          min={0}
                          step={0.01}
                          placeholder="Enter unit price"
                          className="rounded-lg w-full p-3 border-gray-200 focus:ring-2 focus:ring-green-400"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <StyledButton
                            type="primary"
                            htmlType="submit"
                            icon={<PlusOutlined />}
                            loading={loading}
                            style={{ background: "#52c41a", borderColor: "#52c41a" }}
                          >
                            Add Stock
                          </StyledButton>
                        </motion.div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </StyledCard>
            </motion.div>

            {/* Filters and Sorting */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Input
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg p-3 border-gray-200 focus:ring-2 focus:ring-green-400 w-full sm:w-64"
              />
              <RangePicker
                onChange={(dates) => setDateRange(dates || [])}
                className="rounded-lg w-full sm:w-64"
              />
              <Select
                value={sortOrder}
                onChange={(value) => setSortOrder(value)}
                className="rounded-lg w-full sm:w-48"
                dropdownStyle={{ borderRadius: "8px" }}
              >
                <Option value="new">Newest First</Option>
                <Option value="old">Oldest First</Option>
              </Select>
            </motion.div>

            {/* Inventory Items Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <StyledCard>
                <Title level={4} style={{ color: "#2d3748", marginBottom: "24px" }}>
                  Inventory Items
                </Title>
                <StyledTable
                  columns={columns}
                  dataSource={inventory.inventoryItems || []}
                  rowKey="_id"
                  locale={{ emptyText: "No inventory items found." }}
                  scroll={{ x: true }}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: inventory.totalItems || 0,
                    onChange: (page) => setCurrentPage(page),
                  }}
                />
              </StyledCard>
            </motion.div>

            {/* Details Modal */}
            <Modal
              title="Inventory Item Details"
              open={detailsModalVisible}
              onCancel={() => setDetailsModalVisible(false)}
              footer={null}
              style={{ top: 20 }}
            >
              {inventoryItem && (
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Item Name">{inventoryItem.item_name}</Descriptions.Item>
                  <Descriptions.Item label="Current Quantity">
                    {inventoryItem.current_quantity} {inventoryItem.unit}
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Unit Price">
                    ${inventoryItem.average_unit_price.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Value">
                    ${inventoryItem.total_value.toFixed(2)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {moment(inventoryItem.last_updated).format("YYYY-MM-DD HH:mm:ss")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Transaction History">
                    <Table
                      dataSource={inventoryItem.transactions}
                      columns={[
                        {
                          title: "Type",
                          dataIndex: "type",
                          key: "type",
                        },
                        {
                          title: "Quantity",
                          dataIndex: "quantity",
                          key: "quantity",
                        },
                        {
                          title: "Unit Price",
                          dataIndex: "unit_price",
                          key: "unit_price",
                          render: (price) => `$${price.toFixed(2)}`,
                        },
                        {
                          title: "Date",
                          dataIndex: "date",
                          key: "date",
                          render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
                        },
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Modal>

            {/* Use Stock Modal */}
            <Modal
              title={`Use Stock: ${selectedItem?.item_name}`}
              open={useStockModalVisible}
              onCancel={() => {
                setUseStockModalVisible(false);
                setSelectedItem(null);
                useForm.resetFields();
              }}
              footer={null}
              style={{ top: 20 }}
            >
              <Form
                form={useForm}
                layout="vertical"
                onFinish={handleUseStock}
                initialValues={{ quantity: 0 }}
              >
                <Form.Item
                  label="Quantity to Use"
                  name="quantity"
                  rules={[
                    { required: true, message: "Please enter the quantity" },
                    {
                      validator: (_, value) =>
                        value <= selectedItem?.current_quantity
                          ? Promise.resolve()
                          : Promise.reject(new Error("Insufficient stock")),
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={selectedItem?.current_quantity}
                    placeholder="Enter quantity to use"
                    className="rounded-lg w-full p-3 border-gray-200 focus:ring-2 focus:ring-green-400"
                  />
                </Form.Item>
                <Form.Item label="Notes" name="notes">
                  <Input.TextArea
                    placeholder="Optional notes"
                    rows={3}
                    className="rounded-lg border-gray-200 focus:ring-2 focus:ring-green-400"
                  />
                </Form.Item>
                <Form.Item>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <StyledButton
                      type="primary"
                      htmlType="submit"
                      icon={<MinusOutlined />}
                      loading={loading}
                      style={{ background: "#1890ff", borderColor: "#1890ff", marginRight: "8px" ,marginBottom:"8px"}}
                    >
                      Use Stock
                    </StyledButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <StyledButton
                      onClick={() => {
                        setUseStockModalVisible(false);
                        setSelectedItem(null);
                        useForm.resetFields();
                      }}
                    >
                      Cancel
                    </StyledButton>
                  </motion.div>
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </motion.div>
      </div>
    </Fragment>
  );
};

export default ManageInventory;