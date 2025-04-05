/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAnalytics, clearAnalyticsState,computeDailyAnalytics } from "../Redux/Slices/analyticsSlice";
import FloatingSidebar from "../Layout/FloatingSidebar";
import {
  Table,
  Spin,
  notification,
  Layout,
  Typography,
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Button,
} from "antd";
import { FaChartLine } from "react-icons/fa";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import moment from "moment";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const { Content } = Layout;
// Remove this line: const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
    background: #faad14;
    color: white;
    font-weight: 600;
    border-bottom: 2px solid #e8ecef;
  }
  .ant-table-row {
    transition: background 0.2s ease;
    &:hover {
      background: #fff7e6;
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

const Analytics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { analytics, loading, error } = useSelector((state) => state.analytics);

  const [dateRange, setDateRange] = useState([]);
  const [type, setType] = useState("daily");

  useEffect(() => {
    if (dateRange.length === 2) {
      dispatch(
        getAnalytics({
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
          type,
        })
      )
        .unwrap()
        .catch((err) => {
          notification.error({
            message: "Error",
            description: err.message || "Failed to fetch analytics",
            placement: "topRight",
          });
        });
    }
  }, [dispatch, dateRange, type]);

  const handleFetchAnalytics = () => {
    if (dateRange.length !== 2) {
      notification.warning({
        message: "Warning",
        description: "Please select a date range",
        placement: "topRight",
      });
      return;
    }
    dispatch(
      getAnalytics({
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        type,
      })
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" tip="Loading analytics..." />
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
          <StyledButton type="primary" onClick={() => dispatch(getAnalytics())}>
            Retry
          </StyledButton>
          <StyledButton style={{ marginLeft: "16px" }} onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </StyledButton>
        </StyledCard>
      </motion.div>
    );
  }

  const orderCountData = {
    labels: analytics.map((a) => moment(a.date).format(type === "daily" ? "YYYY-MM-DD" : "YYYY-MM")),
    datasets: [
      {
        label: "Total Orders",
        data: analytics.map((a) => a.orders.total),
        borderColor: "#faad14",
        backgroundColor: "rgba(250, 173, 20, 0.2)",
        Filler: true,
      },
    ],
  };

  const orderTypeData = {
    labels: ["Dine-in", "Takeaway", "Online"],
    datasets: [
      {
        data: analytics.reduce(
          (acc, a) => [
            acc[0] + a.orders.by_type["dine-in"],
            acc[1] + a.orders.by_type.takeaway,
            acc[2] + a.orders.by_type.online,
          ],
          [0, 0, 0]
        ),
        backgroundColor: ["#faad14", "#52c41a", "#1890ff"],
      },
    ],
  };

  const paymentMethodData = {
    labels: ["Cash", "Card", "Online"],
    datasets: [
      {
        data: analytics.reduce(
          (acc, a) => [
            acc[0] + a.orders.by_payment_method.cash,
            acc[1] + a.orders.by_payment_method.card,
            acc[2] + a.orders.by_payment_method.online,
          ],
          [0, 0, 0]
        ),
        backgroundColor: ["#ff4d4f", "#1890ff", "#52c41a"],
      },
    ],
  };

  const topItemsData = {
    labels: analytics
      .flatMap((a) => a.items)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5)
      .map((i) => i.item_name),
    datasets: [
      {
        label: "Quantity Sold",
        data: analytics
          .flatMap((a) => a.items)
          .sort((a, b) => b.total_quantity - a.total_quantity)
          .slice(0, 5)
          .map((i) => i.total_quantity),
        backgroundColor: "#faad14",
      },
    ],
  };

  const financialData = {
    labels: analytics.map((a) => moment(a.date).format(type === "daily" ? "YYYY-MM-DD" : "YYYY-MM")),
    datasets: [
      {
        label: "Revenue",
        data: analytics.map((a) => a.financials.total_revenue),
        borderColor: "#52c41a",
        backgroundColor: "rgba(82, 196, 26, 0.2)",
        Filler: true,
      },
      {
        label: "Profit",
        data: analytics.map((a) => a.financials.profit),
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        Filler: true,
      },
    ],
  };

  const inventoryColumns = [
    { title: "Item Name", dataIndex: "item_name", key: "item_name" },
    {
      title: "Current Stock",
      dataIndex: "current_stock",
      key: "current_stock",
      sorter: (a, b) => a.current_stock - b.current_stock,
    },
    {
      title: "Stock Used",
      dataIndex: "stock_used",
      key: "stock_used",
      sorter: (a, b) => a.stock_used - b.stock_used,
    },
  ];

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
              <FaChartLine className="text-4xl text-yellow-600" />
              <p style={{ color: "#1d3557", margin: 0 }}>
                Analytics Dashboard
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RangePicker
                onChange={(dates) => setDateRange(dates || [])}
                className="rounded-lg w-full sm:w-64"
              />
              <Select
                value={type}
                onChange={(value) => setType(value)}
                className="rounded-lg w-full sm:w-48"
                dropdownStyle={{ borderRadius: "8px" }}
              >
                <Option value="daily">Daily</Option>
                <Option value="monthly">Monthly</Option>
              </Select>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <StyledButton type="primary" onClick={handleFetchAnalytics}>
                  Fetch Analytics
                </StyledButton>
              </motion.div>
            </motion.div>

            {analytics.length > 0 && (
              <>
                {/* Order Count Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <StyledCard style={{ marginBottom: "32px" }}>
                    <p  style={{ color: "#2d3748", marginBottom: "24px" }}>
                      Order Count Over Time
                    </p>
                    <Line data={orderCountData} options={{ responsive: true }} />
                  </StyledCard>
                </motion.div>

                {/* Order Types and Payment Methods */}
                <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
                  <Col xs={24} md={12}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <StyledCard>
                        <p style={{ color: "#2d3748", marginBottom: "24px" }}>
                          Order Types
                        </p>
                        <Pie data={orderTypeData} options={{ responsive: true }} />
                      </StyledCard>
                    </motion.div>
                  </Col>
                  <Col xs={24} md={12}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <StyledCard>
                        <p style={{ color: "#2d3748", marginBottom: "24px" }}>
                          Payment Methods
                        </p>
                        <Pie data={paymentMethodData} options={{ responsive: true }} />
                      </StyledCard>
                    </motion.div>
                  </Col>
                </Row>

                {/* Top Selling Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <StyledCard style={{ marginBottom: "32px" }}>
                    <p style={{ color: "#2d3748", marginBottom: "24px" }}>
                      Top 5 Selling Items
                    </p>
                    <Bar data={topItemsData} options={{ responsive: true, indexAxis: "y" }} />
                  </StyledCard>
                </motion.div>

                {/* Financials Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <StyledCard style={{ marginBottom: "32px" }}>
                    <p style={{ color: "#2d3748", marginBottom: "24px" }}>
                      Revenue and Profit Over Time
                    </p>
                    <Line data={financialData} options={{ responsive: true }} />
                  </StyledCard>
                </motion.div>

                {/* Inventory Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <StyledCard>
                    <p  style={{ color: "#2d3748", marginBottom: "24px" }}>
                      Inventory Usage
                    </p>
                    <StyledTable
                      columns={inventoryColumns}
                      dataSource={analytics[analytics.length - 1]?.inventory || []}
                      rowKey="inventory_item_id"
                      locale={{ emptyText: "No inventory data available." }}
                      scroll={{ x: true }}
                      pagination={{ pageSize: 10 }}
                    />
                  </StyledCard>
                </motion.div>
              </>
            )}
          </Content>
        </motion.div>
      </div>
    </Fragment>
  );
};

Analytics.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Analytics;
