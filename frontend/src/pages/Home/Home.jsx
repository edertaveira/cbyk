import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Col,
  Descriptions,
  Divider,
  Form,
  InputNumber,
  Layout,
  List,
  message,
  PageHeader,
  Progress,
  Row,
} from "antd";
import { FaCloud, FaPlane, FaPlaneArrival, FaPlayCircle, FaRoad } from "react-icons/fa";
import moment from "moment";

import "./Home.scss";
import utils from "../../helpers/utils";
import Countdown from "antd/lib/statistic/Countdown";

const Home = (props) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [numAirPort, setNumAirPort] = useState(3);
  const [cPage, setCPage] = useState(1);
  const [percAnimation, setPercAnimation] = useState(0);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {}, []);

  async function onFinish(values) {
    setLoading(true);
    let tryAgain = false;
    try {
      const res = await axios.post(`${utils.SERVER}/calc`, values);
      if (res.data.rows) {
        setResult(res.data.rows);
        setNumAirPort(res.data.airports);
        setCPage(1);
      } else tryAgain = true;
    } catch (e) {
      console.error(e);
      tryAgain = true;
    }
    if (tryAgain) message.error("Something wrong, try again.");
    setLoading(false);
  }

  function getIcon(key) {
    let icon = <FaRoad size={30} color="#efefef" />;
    switch (key) {
      case "A":
        icon = <FaPlaneArrival size={30} color="blue" />;
        break;
      case "*":
        icon = <FaCloud size={30} />;
        break;
      default:
        break;
    }
    return icon;
  }

  function getFirstAirport() {
    console.log(numAirPort);
    const dayFirstAirport = result.filter((item) => item.airports < numAirPort);
    return dayFirstAirport[0] ? dayFirstAirport[0].day : "-";
  }

  function getAllAirport() {
    return result[result.length - 1] ? result[result.length - 1].day : "-";
  }

  return (
    <div className="home">
      <PageHeader
        className="site-page-header"
        title={
          <>
            <FaPlane /> Calc Clouds
          </>
        }
        subTitle="Checking when the voulcan clouds will reach the airports"
      />

      <Form
        onFinish={onFinish}
        size="small"
        layout="inline"
        initialValues={{ airports: 3, clouds: 4, areax: 10, areay: 10 }}
        form={form}
      >
        <Form.Item name="airports" label="Airports">
          <InputNumber min={3} />
        </Form.Item>
        <Form.Item name="clouds" label="Clouds">
          <InputNumber min={4} />
        </Form.Item>
        <Form.Item label="Area" name="areax">
          <InputNumber min={10} />
        </Form.Item>
        <Form.Item label="" name="areay">
          <InputNumber min={10} />
        </Form.Item>

        <Button loading={loading} htmlType="submit" type="primary">
          Calc
        </Button>
      </Form>
      <br />
      {result.length > 0 && (
        <Descriptions bordered title="" size="small">
          <Descriptions.Item label="Days first airport covered">{getFirstAirport()}</Descriptions.Item>
          <Descriptions.Item label="Days all airport covered">{getAllAirport()}</Descriptions.Item>
        </Descriptions>
      )}

      <List
        itemLayout="vertical"
        size="large"
        footer={
          <div className="footer">
            {!loadingAnimation ? (
              <Button
                type="dashed"
                loading={loadingAnimation}
                onClick={() => {
                  if (result.length <= 1) return;
                  setLoadingAnimation(true);
                  setDeadline(moment().add(2000 * result.length));
                  let current = 1;
                  setCPage(current);
                  let total = result.length;
                  const ida = setInterval(() => {
                    if (current <= total) {
                      setCPage(current++);
                      setPercAnimation((100 * (current - 1)) / total);
                    } else {
                      clearInterval(ida);
                      setPercAnimation(0);
                      setLoadingAnimation(false);
                    }
                  }, 2000);
                }}
              >
                Animation
              </Button>
            ) : (
              <Countdown value={deadline} format="ss:SSS" />
            )}
            <Progress percent={percAnimation} showInfo={false} status="active" />
          </div>
        }
        pagination={{
          position: "both",
          current: cPage,
          onChange: (page) => {
            setCPage(page);
          },
          pageSize: 1,
          itemRender: (page, type, originalElement) => {
            //'page' | 'prev' | 'next'
            if (type === "page") {
              let dia = parseInt(page) === 1 || parseInt(page) === 0 ? "Inicio" : `Dia ${parseInt(page) - 1}`;
              return dia;
            }
            return originalElement;
          },
        }}
        dataSource={result}
        renderItem={(item) => (
          <List.Item key={item.day}>
            {item.matrix.map((row, index) => (
              <Row key={index} gutter={16}>
                {row.map((col, indexc) => (
                  <Col key={indexc} span={Math.trunc(24 / form.getFieldValue("areax"))}>
                    {getIcon(col)}
                  </Col>
                ))}
              </Row>
            ))}
          </List.Item>
        )}
      />
    </div>
  );
};

export default withRouter(Home);
