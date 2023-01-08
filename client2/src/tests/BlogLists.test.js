import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { BlogList } from "../BlogList";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { client } from "../setupTests";
it("renders without error", async () => {
    render(_jsx(ApolloProvider, { client: client, children: _jsx(Router, { children: _jsx(Route, { exact: true, path: '/', children: _jsx(BlogList, {}) }) }) }));
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Blog One")).toBeInTheDocument();
    expect(await screen.findByText("Blog Two")).toBeInTheDocument();
});
export const a = 5;
