import { useState, useEffect } from "react";
import axios, { type AxiosResponse } from "axios";
import "./App.css";
import type { Loan, ApiResponse } from "./interfaces/Loan";
import { Tabs, Tab, Table } from "react-bootstrap";

function StatisticsTab() {
  const [data, setData] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    axios
      .get<ApiResponse>("http://127.0.0.1:5000/data")
      .then((response: AxiosResponse<ApiResponse>) => {
        setData(response.data.result);
        setLoading(false);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error("An unknown error occurred"));
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {data.length > 0 &&
            Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, i) => (
              <td key={i}>{value.toString()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function App() {
  return (
    <div className="container mt-5">
      <Tabs
        variant="pills"
        defaultActiveKey="statistics"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="statistics" title="Statystyka">
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <StatisticsTab />
          </div>
        </Tab>
		<Tab eventKey="predictions" title="Predykcje">
          <div>Preddictions Content</div>
        </Tab>
        <Tab eventKey="charts" title="Wykresy">
          <div>Charts Content</div>
        </Tab>
		<Tab eventKey="chernoff-faces" title="Twarze Chernoffa">
          <div>Chernoff Faces Content</div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default App;
