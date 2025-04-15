/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FloatingSidebar from "../Layout/FloatingSidebar";
import { getAllOrders, clearOrderState } from "../Redux/Slices/orderSlice";
import { getPaymentsByOrder, updatePaymentStatus, createPayment, clearPaymentState } from "../Redux/Slices/paymentSlice";
import { Table, Button, Select, Input, DatePicker, Pagination, Modal, Form, Input as AntInput } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ManagePayments = () => {
  const dispatch = useDispatch();
  const { orders, totalOrders, loading: orderLoading, error: orderError } = useSelector((state) => state.order);
  const { payments, loading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);

  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
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
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [form] = Form.useForm();

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
      dispatch(clearPaymentState());
    };
  }, [dispatch, filters, pagination, sort]);

  const handleExpand = (expanded, record) => {
    const newExpandedRowKeys = expanded
      ? [...expandedRowKeys, record._id]
      : expandedRowKeys.filter((key) => key !== record._id);
    setExpandedRowKeys(newExpandedRowKeys);

    if (expanded && record.payment) {
      dispatch(getPaymentsByOrder(record._id));
    }
  };

  const handlePaymentUpdate = (paymentId, payment_status, payment_method, orderStatus) => {
    if (orderStatus !== "completed") {
      toast.error("Payment can only be updated for completed orders", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    dispatch(updatePaymentStatus({ paymentId, payment_status, payment_method })).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Payment updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        dispatch(getPaymentsByOrder(selectedOrderId));
      } else {
        toast.error("Failed to update payment", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    });
  };

  const showCreatePaymentModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleCreatePayment = () => {
    form.validateFields().then((values) => {
      const { payment_method, payment_status, transaction_id } = values;
      const paymentData = {
        orderId: selectedOrderId,
        payment_method,
        transaction_id: transaction_id || null,
        payment_status,
      };

      dispatch(createPayment(paymentData)).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          toast.success("Payment created successfully", {
            position: "top-right",
            autoClose: 3000,
          });
          setIsModalVisible(false);
          form.resetFields();
          fetchOrders();
          dispatch(getPaymentsByOrder(selectedOrderId));
        } else {
          const errorMessage =
            typeof result.payload === "object" && result.payload?.message
              ? result.payload.message
              : "Failed to create payment";
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      });
    }).catch((errorInfo) => {
      console.error("Validation failed:", errorInfo);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedOrderId(null);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span>{text ? text.slice(-6) : "N/A"}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (text) => <span>{text || "Guest"}</span>,
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => `$${price ? price.toFixed(2) : "0.00"}`,
    },
    {
      title: "Order Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "processing"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status || "N/A"}
        </span>
      ),
    },
    {
      title: "Payment Method",
      key: "payment_method",
      render: (record) => {
        const payment = payments.find((p) => p.order === record._id);
        return payment ? (
          <Select
            value={payment.payment_method}
            style={{ width: 120 }}
            onChange={(value) =>
              handlePaymentUpdate(payment._id, payment.payment_status, value, record.status)
            }
            disabled={paymentLoading || record.status !== "completed" || record.status === "cancelled"}
          >
            <Option value="cash">Cash</Option>
            <Option value="card">Card</Option>
            <Option value="online">Online</Option>
          </Select>
        ) : (
          <span className="text-gray-500">No Payment</span>
        );
      },
    },
    {
      title: "Payment Status",
      key: "payment_status",
      render: (record) => {
        const payment = payments.find((p) => p.order === record._id);
        return payment ? (
          <Select
            value={payment.payment_status}
            style={{ width: 120 }}
            onChange={(value) =>
              handlePaymentUpdate(payment._id, value, payment.payment_method, record.status)
            }
            disabled={paymentLoading || record.status !== "completed" || record.status === "cancelled"}
          >
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="refunded">Refunded</Option>
          </Select>
        ) : (
          <span className="text-gray-500">No Payment</span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? moment(date).format("YYYY-MM-DD HH:mm") : "N/A"),
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="medium"
            onClick={() => navigate(`/view-order/${record._id}`)}
            disabled={record.status !== "completed"}
          >
            View Details
          </Button>
          {!record.payment && record.status === "completed" && (
            <Button
              type="primary"
              size="medium"
              onClick={() => showCreatePaymentModal(record._id)}
              loading={paymentLoading}
            >
              Create Payment
            </Button>
          )}
        </div>
      ),
    },
  ];

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
    const payment = payments.find((p) => p.order === record._id);
    const columns = [
      {
        title: "Payment ID",
        dataIndex: "_id",
        key: "_id",
        render: (text) => (text ? text.slice(-6) : "N/A"),
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => `$${amount ? amount.toFixed(2) : "0.00"}`,
      },
      {
        title: "Payment Method",
        dataIndex: "payment_method",
        key: "payment_method",
      },
      {
        title: "Status",
        dataIndex: "payment_status",
        key: "payment_status",
        render: (status) => (
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              status === "completed"
                ? "bg-green-100 text-green-800"
                : status === "failed" || status === "refunded"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status || "N/A"}
          </span>
        ),
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) => (date ? moment(date).format("YYYY-MM-DD HH:mm") : "N/A"),
      },
    ];

    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Details</h3>
        {payment ? (
          <Table
            columns={columns}
            dataSource={[payment]}
            pagination={false}
            rowKey="_id"
            bordered
          />
        ) : (
          <p className="text-gray-500">No payment found for this order.</p>
        )}
      </div>
    );
  };

  return (
    <Fragment>
      <div className="main-div flex">
        <FloatingSidebar />
        <div className="content w-full p-6 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Manage Payments</h1>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={orderLoading || paymentLoading}
            >
              Refresh
            </Button>
          </div>
          <div className="filters mb-6 flex gap-4 flex-wrap">
            <Input
              placeholder="Search by customer"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filter by order status"
              value={filters.orderStatus || undefined}
              onChange={(value) => handleFilterChange("orderStatus", value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Select
              placeholder="Filter by payment status"
              value={filters.paymentStatus || undefined}
              onChange={(value) => handleFilterChange("paymentStatus", value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
            <RangePicker onChange={handleDateRangeChange} format="YYYY-MM-DD" />
          </div>
          <Table
            columns={columns}
            dataSource={orders || []}
            rowKey="_id"
            loading={orderLoading || paymentLoading}
            onChange={handleTableChange}
            pagination={false}
            expandable={{
              expandedRowRender,
              rowExpandable: (record) => !!record.payment,
              expandedRowKeys,
              onExpand: handleExpand,
            }}
          />
          <div className="mt-4 flex justify-end">
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={totalOrders || 0}
              onChange={handlePaginationChange}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
            />
          </div>
          {(orderError || paymentError) && (
            <div className="mt-4 text-red-500">
              Error:{" "}
              {orderError
                ? typeof orderError === "object" && orderError?.message
                  ? orderError.message
                  : String(orderError)
                : typeof paymentError === "object" && paymentError?.message
                ? paymentError.message
                : String(paymentError)}
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Create Payment"
        open={isModalVisible}
        onOk={handleCreatePayment}
        onCancel={handleModalCancel}
        okText="Create Payment"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[{ required: true, message: "Please select a payment method" }]}
            initialValue="cash"
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="online">Online</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="payment_status"
            label="Payment Status"
            rules={[{ required: true, message: "Please select a payment status" }]}
            initialValue="pending"
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.payment_method !== currentValues.payment_method ||
              prevValues.payment_status !== currentValues.payment_status
            }
          >
            {({ getFieldValue }) => {
              const paymentMethod = getFieldValue("payment_method");
              const paymentStatus = getFieldValue("payment_status");
              const isTransactionIdRequired =
                (paymentMethod === "card" || paymentMethod === "online") && paymentStatus === "completed";

              return (
                <Form.Item
                  name="transaction_id"
                  label="Transaction ID"
                  rules={[
                    {
                      required: isTransactionIdRequired,
                      message: "Transaction ID is required for completed card/online payments",
                    },
                  ]}
                >
                  <AntInput
                    placeholder="Enter transaction ID"
                    disabled={!isTransactionIdRequired}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

      <ToastContainer autoClose={3000} />
    </Fragment>
  );
};

export default ManagePayments;