
import {ComponentStory} from '@storybook/react';
import {BlogList} from "../BlogList";
import {BLOGS_QUERY} from "../graphql/queries";
import {MockedProvider} from "@apollo/client/testing";
import {BrowserRouter as Router, Route} from 'react-router-dom';

export default {
    title: 'BlogList1',
    component: BlogList,
}

const now = new Date();
const blogsMock = [{
    request: {
        query: BLOGS_QUERY,
    },
    result: {
        data: {
            blogs: {
                __typename: 'BlogResponse',
                nodes: [{
                    __typename: 'Blog',
                    id: 'dummy1',
                    name: 'Blog One',
                    handle: 'blog1',
                    created: now,
                    updated: now,
                    user: {
                        __typename: 'User',
                        id: 'user1',
                        username:'user1'
                    }
                },
                {
                    __typename: 'Blog',
                    id: 'dummy2',
                    name: 'Blog Two',
                    handle: 'blog2',
                    created: now,
                    updated: now,
                    user: {
                        __typename: 'User',
                        id: 'user2',
                        username:'user2'
                    }
                },
            ]}
        },
    },
}];

const Template: ComponentStory<typeof BlogList> = () =>
    <MockedProvider mocks={blogsMock} addTypename={false}>
        <Router>
            <Route exact path='/'>
                <BlogList />
            </Route>
        </Router>
    </MockedProvider>;
export const Default = Template.bind({});