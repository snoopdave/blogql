import "@testing-library/jest-dom";
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import {BlogList} from "../BlogList";
import {BLOGS_QUERY} from "../graphql/queries";
import {Route, BrowserRouter as Router} from "react-router-dom";

it("renders without error", async () => {
    const now = new Date();
    const blogsMock = [{
        request: {
            query: BLOGS_QUERY,
        },
        result: {
            data: { blogs: { nodes: [
                {id: 'dummy1', name: 'Blog One', handle: 'blog1', created: now, updated: now,
                    user: {id: 'user1', username:'user1'}},
                {id: 'dummy2', name: 'Blog Two', handle: 'blog2', created: now, updated: now,
                    user: {id: 'user2', username:'user2'}},
            ] } },
        },
    }];
    render(
        <MockedProvider mocks={blogsMock} addTypename={false}>
            <Router>
                <Route exact path='/'>
                    <BlogList />
                </Route>
            </Router>
        </MockedProvider>
    );
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Blog One")).toBeInTheDocument();
    expect(await screen.findByText("Blog Two")).toBeInTheDocument();
});
