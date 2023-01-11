import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {BLOGS_QUERY} from './graphql/queries';
import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {Blog} from "./graphql/schema";


export function BlogList() {
    const { loading, error, data } = useQuery(BLOGS_QUERY);
    if (loading) {
        console.log('BlogList: Loading...');
        return (<p>Loading...</p>);
    }
    if (error) {
        console.log('BlogList: Error');
        return (<p>error!</p>);
    }
    if (!data) {
        console.log('BlogList: No data');
        return (<p>no data!</p>);
    }

    console.log('BlogList: rendering');
    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Handle</th>
                <th>Name</th>
            </tr>
            </thead>
            <tbody>{ data.blogs?.nodes.map((blog: Blog) => blog ? (
                <tr key={blog.id}>
                    <td><Link className='nav-link' to={`/blogs/${blog.handle}`}>{blog.name}</Link></td>
                    <td><Link className='nav-link' to={`/blogs/${blog.handle}`}>TODO</Link></td>
                </tr> ) : null)
            }</tbody>
        </Table>
    );
}