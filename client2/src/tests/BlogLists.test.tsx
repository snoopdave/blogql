
import { render, screen } from "@testing-library/react";
import {BlogList} from "../BlogList";
import {Route, BrowserRouter as Router} from "react-router-dom";
import {ApolloProvider} from "@apollo/client";
import {client} from "../setupTests";

it("renders without error", async () => {
    render(
        <ApolloProvider client={client}>
            <Router>
                <Route exact path='/'>
                    <BlogList />
                </Route>
            </Router>
        </ApolloProvider>
    );
    expect(await screen.findByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Blog One")).toBeInTheDocument();
    expect(await screen.findByText("Blog Two")).toBeInTheDocument();
});

export const a = 5;