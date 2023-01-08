import {BlogList} from "../BlogList";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";

export default {
    title: 'BlogList',
    component: BlogList,
}

export const Blogs = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='/'>
                <BlogList />
            </Route>
        </Router>
    </ApolloProvider>
