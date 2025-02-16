import React, { useEffect, useState } from "react";
import { fetchTrades, handleAddTrade, logout } from "../api";
import { Button, Modal, Input, Select, Table, Empty, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const { Option } = Select;

const Home = () => {
  const [trades, setTrades] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState({ type: "buy", user_id: "", symbol: "", shares: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filterType] = useState("");
  const [tradeType, setTradeType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadTrades();
  }, [filterType]);

  const loadTrades = async () => {
    setLoading(true);
    const data = await fetchTrades("all");
    setTrades(data || []);
    setLoading(false);
  };

  const handleFilterChange = async (value) => {
    setTradeType(value);
    setLoading(true);
    const data = await fetchTrades(value);
    setTrades(data || []);
    setLoading(false);
  };

  const handleSubmitTrade = async () => {
    if (!form.symbol || !form.shares || !form.price) {
      setErrorMessage("All fields are required!");
      return;
    }
    await handleAddTrade(form);
    setSuccessMessage("Trade added successfully!");
    setForm({ type: "buy", symbol: "", shares: "", price: "" });
    loadTrades();
    setIsModalVisible(false);
  };

  const handleUserLogout = async () => {
    await logout();
    navigate("/");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", responsive: ["md"] },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <span className={type === "buy" ? "type-buy" : "type-sell"}>
          {type.toUpperCase()}
        </span>
      ),
    },
    { title: "Symbol", dataIndex: "symbol", key: "symbol" },
    { title: "Shares", dataIndex: "shares", key: "shares" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Time", dataIndex: "timestamp", key: "timestamp" },
  ];

  return (
    <div className="home-container">
      {/* Logout Button */}
      <div className="logout-container">
        <Button className="logout-button" onClick={handleUserLogout}>
          🚪 Logout
        </Button>
      </div>

      <h1 className="title">📊 Trade Records</h1>

      {/* Filter Trades */}
      <div className="filter-container">
        <span className="filter-label">Filter by Type:</span>
        <select
            className="type-filter"
            value={tradeType}
            onChange={(e) => handleFilterChange(e.target.value)}
        >
            <option value="">All</option>
            <option value="buy">📈 Buy</option>
            <option value="sell">📉 Sell</option>
        </select>
        </div>


      {/* Add Trade Button */}
      <div className="button-container">
        <Button className="add-trade-button" onClick={() => setIsModalVisible(true)}>
          ➕ Add Trade
        </Button>
      </div>

      {/* Trades Table */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : trades.length === 0 ? (
        <div className="empty-container">
          <Empty description="No trades available" />
        </div>
      ) : (
        <div className="table-container">
          <Table
            dataSource={trades}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="trade-table"
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      {/* Add Trade Modal */}
      <Modal
        title={<h2 className="modal-title">📌 Add New Trade</h2>}
        open={isModalVisible}
        onOk={handleSubmitTrade}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)} className="modal-cancel">
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmitTrade} className="modal-submit">
            Submit Trade
          </Button>,
        ]}
        className="trade-modal"
      >
        <div className="modal-content">
          {errorMessage !== "" && <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}
          {successMessage !== "" && <p style={{ color: "green", textAlign: "center" }}>{successMessage}</p>}

          <Select
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
            className="input-field"
            style={{ width: "100%" }}
          >
            <Option value="buy">Buy</Option>
            <Option value="sell">Sell</Option>
          </Select>

          <Input
            placeholder="Symbol"
            value={form.symbol}
            className="input-field full-width"
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          />
          <Input
            placeholder="Shares"
            type="number"
            value={form.shares}
            className="input-field full-width"
            onChange={(e) => setForm({ ...form, shares: e.target.value })}
          />
          <Input
            placeholder="Price"
            type="number"
            value={form.price}
            className="input-field full-width"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Home;
