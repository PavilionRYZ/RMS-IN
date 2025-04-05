import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FloatingSidebar from "../Layout/FloatingSidebar";
import { getAllOrders, updateOrderStatus, clearOrderState } from "../Redux/Slices/orderSlice";
import { Table, Select, Input, DatePicker, Pagination } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const { Option } = Select;
const { RangePicker } = DatePicker;


const ManageOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, totalOrders } = useSelector((state) => state.order);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: null,
    endDate: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [sort, setSort] = useState({
    sortBy: "createdAt",
    order: "desc",
  });
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const fetchOrders = () => {
    const queryParams = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      sortBy: sort.sortBy,
      order: sort.order,
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
    };
    dispatch(getAllOrders(queryParams));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => {
      clearInterval(interval);
      dispatch(clearOrderState());
    };
  }, [dispatch, filters, pagination, sort]);

  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount !== 0) {
      const newOrdersCount = orders.length - lastOrderCount;
      toast.success(`New Order${newOrdersCount > 1 ? "s" : ""} Received: ${newOrdersCount}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-mono text-blue-600">{text.slice(-6)}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (text) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: "Table No",
      dataIndex: "table_no",
      key: "table_no",
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => <span className="font-semibold text-green-600">${price.toFixed(2)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          disabled={loading || status === "completed"}
          className="rounded-md"
        >
          <Option value="pending">Pending</Option>
          <Option value="processing">Processing</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
      sorter: true,
    },
  ];

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      startDate: dates?.[0]?.toISOString(),
      endDate: dates?.[1]?.toISOString(),
    }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setSort({
        sortBy: sorter.field,
        order: sorter.order === "ascend" ? "asc" : "desc",
      });
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ page, limit: pageSize });
  };

  const handleRefresh = () => {
    fetchOrders();
    toast.info("Orders refreshed", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Item Name",
        dataIndex: ["menu_item", "name"],
        key: "name",
        render: (text) => <span className="text-gray-800">{text}</span>,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        render: (text) => <span className="font-semibold">{text}</span>,
      },
      {
        title: "Special Instructions",
        dataIndex: "specialInstructions",
        key: "specialInstructions",
        render: (text) => <span className="text-gray-600">{text || "None"}</span>,
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-gray-50 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h3>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <p className="text-gray-600 text-lg">
            <span className="font-semibold">Order Type:</span> {record.order_type.toUpperCase()}
          </p>
          <p className="text-gray-600 text-lg">
            <span className="font-semibold">Table No:</span> {record.table_no}
          </p>
          <p className="text-gray-600 text-lg">
            <span className="font-semibold">Order Status:</span>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                record.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : record.status === "processing"
                  ? "bg-yellow-100 text-yellow-800"
                  : record.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {record.status}
            </span>
          </p>
        </div>
        <Table
          columns={columns}
          dataSource={record.items}
          pagination={false}
          rowKey={(item) => item.menu_item._id}
          bordered
          className="bg-white rounded-lg overflow-hidden shadow-md"
        />
      </motion.div>
    );
  };

  return (
    <Fragment>
      <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Sidebar */}
        <div className="left-side-navigation">
          <FloatingSidebar />
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 p-6 md:p-10`}
        >
          {/* Header */}
          <motion.header 
            className="margin mb-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse">
                Manage Orders
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                View and manage customer orders efficiently.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                <ReloadOutlined className="mr-2" />
                Refresh Orders
              </button>
            </div>
          </motion.header>

          {/* Filters Section */}
          <motion.section 
            className="margin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Filters</h2>
              <div className="flex flex-wrap gap-4">
                <Input
                  placeholder="Search by customer or table"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  style={{ width: 250 }}
                  className="rounded-lg"
                />
                <Select
                  placeholder="Filter by status"
                  value={filters.status || undefined}
                  onChange={(value) => handleFilterChange("status", value)}
                  style={{ width: 180 }}
                  allowClear
                  className="rounded-lg"
                >
                  <Option value="pending">Pending</Option>
                  <Option value="processing">Processing</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
                <RangePicker
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                  className="rounded-lg"
                />
              </div>
            </div>
          </motion.section>

          {/* Orders Table Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order List</h2>
              
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                loading={loading}
                onChange={handleTableChange}
                pagination={false}
                className="bg-white rounded-lg overflow-hidden"
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => record.items && record.items.length > 0,
                }}
              />

              {/* Pagination */}
              <div className="mt-6 flex justify-end">
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.limit}
                  total={totalOrders}
                  onChange={handlePaginationChange}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50"]}
                  showQuickJumper
                />
              </div>
            </div>
          </motion.section>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-50 text-red-600 font-semibold rounded-lg shadow-md"
            >
              Error: {error}
            </motion.div>
          )}
        </div>
      </div>
      <ToastContainer autoClose={3000} />
    </Fragment>
  );
};

ManageOrders.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default ManageOrders;