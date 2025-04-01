/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import {
  getMenuItems,
  createMenuItem,
  editMenuItem,
  deleteMenuItem,
  resetMenu,
  resetMenuItem,
} from "../Redux/Slices/menuSlice";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Popconfirm,
  Spin,
  notification,
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Upload,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { storage } from "../Storage/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { MdRestaurantMenu } from "react-icons/md";
import { motion } from "framer-motion";
import styled from "styled-components";
import { debounce } from "lodash";

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

const ManageMenu = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { menu, menuItem, loading, error } = useSelector((state) => state.menu);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [totalItems, setTotalItems] = useState(0); // Use total items for pagination
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
    minPrice: null,
    maxPrice: null,
    inStock: false,
  });

  // Fetch menu items with filters and pagination
  const fetchMenuItems = useCallback(() => {
    const queryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      category: filters.category || undefined,
      type: filters.type || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      inStock: filters.inStock ? true : undefined,
    };

    dispatch(getMenuItems(queryParams))
      .unwrap()
      .then((result) => {
        // Update total items for pagination
        setTotalItems(result.totalItems || result.count || 0);
      })
      .catch((err) => {
        notification.error({
          message: "Error",
          description: err.message || "Failed to fetch menu items",
          placement: "topRight",
        });
      });
  }, [dispatch, pagination, filters]);

  useEffect(() => {
    fetchMenuItems();
    return () => {
      dispatch(resetMenu([]));
      dispatch(resetMenuItem());
    };
  }, [dispatch, fetchMenuItems]);

  // Handle action completion (create/edit/delete)
  useEffect(() => {
    if (actionCompleted) {
      notification.success({
        message: "Success",
        description: actionCompleted.message,
        placement: "topRight",
      });
      setActionCompleted(null);
      fetchMenuItems();
      dispatch(resetMenuItem());
    }
  }, [actionCompleted, fetchMenuItems, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      notification.error({
        message: "Error",
        description: error.message || "An error occurred",
        placement: "topRight",
      });
    }
  }, [error]);

  const uploadImagesToFirebase = async (files) => {
    setUploading(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const fileRef = ref(storage, `menu-items/${uuidv4()}-${file.name}`);
        await uploadBytes(fileRef, file.file);
        const url = await getDownloadURL(fileRef);
        uploadedUrls.push(url);
      }
    } catch (error) {
      console.error("Error uploading images to Firebase:", error);
      throw error;
    } finally {
      setUploading(false);
    }
    return uploadedUrls;
  };

  const handleCreateMenuItem = async (values) => {
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const filesToUpload = imageFiles.filter((file) => file.file);
        if (filesToUpload.length > 0) {
          imageUrls = await uploadImagesToFirebase(filesToUpload);
        }
      }

      if (imageUrls.length === 0) {
        notification.error({
          message: "Error",
          description: "Please upload at least one image",
          placement: "topRight",
        });
        return;
      }

      const menuItemData = { ...values, imageUrl: imageUrls };
      await dispatch(createMenuItem(menuItemData)).unwrap();
      setActionCompleted({ message: "Menu item created successfully!" });
      createForm.resetFields();
      setImageFiles([]);
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to create menu item",
        placement: "topRight",
      });
    }
  };

  const handleOpenUpdateModal = (item) => {
    setSelectedItem(item);
    updateForm.setFieldsValue({
      name: item.name,
      category: item.category,
      type: item.type,
      price: item.price,
      description: item.description,
      isFreshlyMade: item.isFreshlyMade,
      stock: item.stock,
    });
    setImageFiles(
      item.imageUrl.map((url, index) => ({
        uid: index,
        name: `image-${index}`,
        status: "done",
        url,
      }))
    );
    setUpdateModalVisible(true);
  };

  const handleUpdateMenuItem = async (values) => {
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const filesToUpload = imageFiles.filter((file) => file.file);
        if (filesToUpload.length > 0) {
          imageUrls = await uploadImagesToFirebase(filesToUpload);
        }
        const existingUrls = imageFiles
          .filter((file) => !file.file && file.url)
          .map((file) => file.url);
        imageUrls = [...existingUrls, ...imageUrls];
      }

      const menuItemData = { ...values, imageUrl: imageUrls };
      await dispatch(
        editMenuItem({ _id: selectedItem._id, ...menuItemData })
      ).unwrap();
      setActionCompleted({ message: "Menu item updated successfully!" });
      setUpdateModalVisible(false);
      setSelectedItem(null);
      setImageFiles([]);
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to update menu item",
        placement: "topRight",
      });
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await dispatch(deleteMenuItem(id)).unwrap();
      setActionCompleted({ message: "Menu item deleted successfully!" });
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.message || "Failed to delete menu item",
        placement: "topRight",
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  // const handlePaginationChange = (page, pageSize) => {
  //   setPagination({ page, limit: pageSize });
  // };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock, record) =>
        record.isFreshlyMade ? (
          <span className="text-green-600 font-medium">Freshly Made</span>
        ) : (
          <span className={stock > 0 ? "text-green-600" : "text-red-600"}>
            {stock}
          </span>
        ),
    },
    {
      title: "Images",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <div className="flex gap-2">
          {imageUrl.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Menu Item ${index}`}
              className="w-12 h-12 object-cover rounded-md"
              onError={(e) => (e.target.src = "https://placehold.co/50x50?text=No+Image")}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Availability",
      dataIndex: "isFreshlyMade",
      key: "isFreshlyMade",
      render: (isFreshlyMade, record) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            isFreshlyMade || record.stock > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isFreshlyMade || record.stock > 0 ? "Available" : "Out of Stock"}
        </span>
      ),
    },
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
            onConfirm={() => handleDeleteMenuItem(record._id)}
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

  const uploadProps = {
    onRemove: (file) => {
      setImageFiles((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setImageFiles((prev) => [
        ...prev,
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
          file,
        },
      ]);
      return false;
    },
    fileList: imageFiles,
    multiple: true,
    listType: "picture-card",
  };

  if (loading && !menu.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Loading menu items..." fullscreen />
      </div>
    );
  }

  if (error && !menu.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
      >
        <StyledCard>
          <p style={{ color: "#ff4d4f", fontSize: "18px", marginBottom: "16px" }}>{error.message}</p>
          <StyledButton type="primary" onClick={fetchMenuItems}>
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
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <motion.div
          className={`content w-full p-6 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
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
              <MdRestaurantMenu className="text-4xl text-blue-500" />
              <Title level={2} style={{ color: "#1d3557", margin: 0 }}>
                Manage Menu
              </Title>
            </motion.div>

            {/* Create New Menu Item Form */}
            <StyledCard style={{ marginBottom: "24px" }}>
              <Title level={4} style={{ color: "#2d3748" }}>
                Add New Menu Item
              </Title>
              <Form
                form={createForm}
                layout="vertical"
                onFinish={handleCreateMenuItem}
                initialValues={{ isFreshlyMade: false }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[{ required: true, message: "Please enter the menu item name" }]}
                    >
                      <Input placeholder="Enter menu item name" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true, message: "Please enter a description" }]}
                    >
                      <Input.TextArea
                        placeholder="Enter description"
                        rows={4}
                        style={{ borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="category"
                      label="Category"
                      rules={[{ required: true, message: "Please select a category" }]}
                    >
                      <Select placeholder="Select category" style={{ borderRadius: "6px" }}>
                        <Option value="veg">Veg</Option>
                        <Option value="non-veg">Non-Veg</Option>
                        <Option value="beverages">Beverages</Option>
                        <Option value="mocktails">Mocktails</Option>
                        <Option value="cocktails">Cocktails</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="Type"
                      rules={[{ required: true, message: "Please select a type" }]}
                    >
                      <Select placeholder="Select type" style={{ borderRadius: "6px" }}>
                        <Option value="Indian">Indian</Option>
                        <Option value="Chinese">Chinese</Option>
                        <Option value="Italian">Italian</Option>
                        <Option value="Continental">Continental</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="price"
                      label="Price"
                      rules={[{ required: true, message: "Please enter the price" }]}
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        placeholder="Enter price"
                        style={{ width: "100%", borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="isFreshlyMade"
                      label="Freshly Made"
                      rules={[{ required: true, message: "Please select if the item is freshly made" }]}
                    >
                      <Select placeholder="Select if freshly made" style={{ borderRadius: "6px" }}>
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.isFreshlyMade !== currentValues.isFreshlyMade
                      }
                    >
                      {({ getFieldValue }) =>
                        !getFieldValue("isFreshlyMade") && (
                          <Form.Item
                            name="stock"
                            label="Stock"
                            rules={[{ required: true, message: "Please enter the stock quantity" }]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Enter stock quantity"
                              style={{ width: "100%", borderRadius: "6px" }}
                            />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Images"
                      rules={[{ required: true, message: "Please upload at least one image" }]}
                    >
                      <Upload {...uploadProps}>
                        <div className="flex flex-col items-center">
                          <UploadOutlined />
                          <div className="mt-2">Upload</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item>
                      <StyledButton
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        loading={uploading || loading}
                        style={{ background: "#1890ff", borderColor: "#1890ff" }}
                      >
                        Add Menu Item
                      </StyledButton>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </StyledCard>

            {/* Filter and Search Section */}
            {/* <StyledCard style={{ marginBottom: "24px" }}>
              <Title level={4} style={{ color: "#2d3748" }}>
                Filter Menu Items
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Input
                    placeholder="Search by name"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    style={{ borderRadius: "6px" }}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Filter by category"
                    value={filters.category || undefined}
                    onChange={(value) => handleFilterChange("category", value)}
                    allowClear
                    style={{ width: "100%", borderRadius: "6px" }}
                  >
                    <Option value="veg">Veg</Option>
                    <Option value="non-veg">Non-Veg</Option>
                    <Option value="beverages">Beverages</Option>
                    <Option value="mocktails">Mocktails</Option>
                    <Option value="cocktails">Cocktails</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Filter by type"
                    value={filters.type || undefined}
                    onChange={(value) => handleFilterChange("type", value)}
                    allowClear
                    style={{ width: "100%", borderRadius: "6px" }}
                  >
                    <Option value="Indian">Indian</Option>
                    <Option value="Chinese">Chinese</Option>
                    <Option value="Italian">Italian</Option>
                    <Option value="Continental">Continental</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <InputNumber
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(value) => handleFilterChange("minPrice", value)}
                    style={{ width: "100%", borderRadius: "6px" }}
                    min={0}
                  />
                </Col>
                <Col span={6}>
                  <InputNumber
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(value) => handleFilterChange("maxPrice", value)}
                    style={{ width: "100%", borderRadius: "6px" }}
                    min={0}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Stock Status"
                    value={filters.inStock ? "inStock" : undefined}
                    onChange={(value) => handleFilterChange("inStock", value === "inStock")}
                    allowClear
                    style={{ width: "100%", borderRadius: "6px" }}
                  >
                    <Option value="inStock">In Stock</Option>
                  </Select>
                </Col>
              </Row>
            </StyledCard> */}

            {/* List of Menu Items */}
            <StyledCard>
              <Title level={4} style={{ color: "#2d3748" }}>
                All Menu Items
              </Title>
              <StyledTable
                columns={columns}
                dataSource={menu}
                rowKey="_id"
                locale={{ emptyText: "No menu items found." }}
                scroll={{ x: true }}
                pagination={false}
                loading={loading}
              />
              {/* <div style={{ marginTop: "16px", textAlign: "right" }}>
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.limit}
                  total={totalItems} // Use totalItems from backend
                  onChange={handlePaginationChange}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50"]}
                />
              </div> */}
            </StyledCard>

            {/* Update Menu Item Modal */}
            <Modal
              title="Update Menu Item"
              open={updateModalVisible}
              onCancel={() => {
                setUpdateModalVisible(false);
                setSelectedItem(null);
                setImageFiles([]);
              }}
              footer={null}
              style={{ top: 20 }}
              Style={{ padding: "24px", background: "#f9f9f9", borderRadius: "8px" }}
            >
              <Form form={updateForm} layout="vertical" onFinish={handleUpdateMenuItem}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[{ required: true, message: "Please enter the menu item name" }]}
                    >
                      <Input placeholder="Enter menu item name" style={{ borderRadius: "6px" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true, message: "Please enter a description" }]}
                    >
                      <Input.TextArea
                        placeholder="Enter description"
                        rows={4}
                        style={{ borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="category"
                      label="Category"
                      rules={[{ required: true, message: "Please select a category" }]}
                    >
                      <Select placeholder="Select category" style={{ borderRadius: "6px" }}>
                        <Option value="veg">Veg</Option>
                        <Option value="non-veg">Non-Veg</Option>
                        <Option value="beverages">Beverages</Option>
                        <Option value="mocktails">Mocktails</Option>
                        <Option value="cocktails">Cocktails</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="Type"
                      rules={[{ required: true, message: "Please select a type" }]}
                    >
                      <Select placeholder="Select type" style={{ borderRadius: "6px" }}>
                        <Option value="Indian">Indian</Option>
                        <Option value="Chinese">Chinese</Option>
                        <Option value="Italian">Italian</Option>
                        <Option value="Continental">Continental</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="price"
                      label="Price"
                      rules={[{ required: true, message: "Please enter the price" }]}
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        placeholder="Enter price"
                        style={{ width: "100%", borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="isFreshlyMade"
                      label="Freshly Made"
                      rules={[{ required: true, message: "Please select if the item is freshly made" }]}
                    >
                      <Select placeholder="Select if freshly made" style={{ borderRadius: "6px" }}>
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.isFreshlyMade !== currentValues.isFreshlyMade
                      }
                    >
                      {({ getFieldValue }) =>
                        !getFieldValue("isFreshlyMade") && (
                          <Form.Item
                            name="stock"
                            label="Stock"
                            rules={[{ required: true, message: "Please enter the stock quantity" }]}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Enter stock quantity"
                              style={{ width: "100%", borderRadius: "6px" }}
                            />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Images">
                      <Upload {...uploadProps}>
                        <div className="flex flex-col items-center">
                          <UploadOutlined />
                          <div className="mt-2">Upload</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item>
                      <StyledButton
                        type="primary"
                        htmlType="submit"
                        icon={<EditOutlined />}
                        loading={uploading || loading}
                        style={{ marginRight: "8px", background: "#1890ff", borderColor: "#1890ff" }}
                      >
                        Update
                      </StyledButton>
                      <StyledButton
                        onClick={() => {
                          setUpdateModalVisible(false);
                          setSelectedItem(null);
                          setImageFiles([]);
                        }}
                      >
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

ManageMenu.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default ManageMenu;