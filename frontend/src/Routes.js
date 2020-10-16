import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Loadable from "react-loadable";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const PageLoading = ({ isLoading, error }) => {
  if (isLoading) {
    const style = {
      textAlign: "center",
      marginBottom: "20px",
      padding: "60px 60px",
      margin: "20px 0",
    };
    return (
      <div style={style}>
        <Spin indicator={<LoadingOutlined />} />
      </div>
    );
  } else if (error) {
    console.error(error);
    return <div>Erro ao carregar esta página.</div>;
  }

  return null;
};

const asyncHome = Loadable({
  loader: () => import("./pages/Home"),
  loading: PageLoading,
});

export default function Routes() {
  return (
    <BrowserRouter>
      <Route exact path={"/"} component={asyncHome} />
    </BrowserRouter>
  );
}
