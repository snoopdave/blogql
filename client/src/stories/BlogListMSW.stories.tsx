import {BlogList} from "../BlogList";
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";

export default {
    title: 'BlogListMSW',
    component: BlogList,
} as ComponentMeta<typeof BlogList>;

export const Primary: ComponentStory<typeof BlogList> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route path='*'>
                <BlogList />
            </Route>
        </Router>
    </ApolloProvider>;

