import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../Layout/Sidebar";
import { 
  getAllOrders, 
  updateOrderStatus, 
  clearOrderState 
} from "../Redux/Slices/orderSlice";
import { Table, Button, Select, Input, DatePicker, Pagination } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import PropTypes from "prop-types";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ManageOrders = ({ isSidebarOpen, setIsSidebarOpen }) => {
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
      render: (text) => <span>{text.slice(-6)}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
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
      render: (price) => `$${price.toFixed(2)}`,
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

  // Define the expanded row render function
  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Item Name",
        dataIndex: ["menu_item", "name"],
        key: "name",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Special Instructions",
        dataIndex: "specialInstructions",
        key: "specialInstructions",
        render: (text) => text || "None",
      },
    ];

    return (
      <div className="p-4 bg-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-black mb-2">Order Details</h3>
        <div className="mb-4">
          <p className="text-gray-600">
            <span className="font-semibold">Order Type:</span>{" "}
            {record.order_type.toUpperCase()}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Table No:</span>{" "}
            {record.table_no}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Order Status:</span>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                record.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : record.status === "processing"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
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
        />
      </div>
    );
  };

  return (
    <Fragment>
      <div className="main-div flex">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div
          className={`content w-full p-6 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`} // Adjust margin based on sidebar width
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Manage Orders</h1>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
          <div className="filters mb-6 flex gap-4 flex-wrap">
            <Input
              placeholder="Search by customer or table"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filter by status"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <RangePicker
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
          </div>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            loading={loading}
            onChange={handleTableChange}
            pagination={false}
            expandable={{
              expandedRowRender,
              rowExpandable: (record) => record.items && record.items.length > 0,
            }}
          />
          <div className="mt-4 flex justify-end">
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={totalOrders}
              onChange={handlePaginationChange}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
            />
          </div>
          {error && (
            <div className="mt-4 text-red-500">
              Error: {error}
            </div>
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