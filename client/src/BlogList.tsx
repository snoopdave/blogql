import {useQuery} from '@apollo/client';
import {BLOGS_QUERY} from './graphql/queries';
import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from "react-router-dom";


export function BlogList() {
    const { loading, error, data } = useQuery(BLOGS_QUERY);
    if (loading) {
        return (<img className='spinner' src='/loading-buffering.gif' alt='Loading...' />);
    }
    if (error) {
        return (<p>${error}</p>);
    }
    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Handle</th>
                <th>Name</th>
            </tr>
            </thead>
            <tbody>{ data.blogs?.nodes.map((blog) => blog ? (
                <tr key={blog.id}>
                    <td><Link className='nav-link' to={`/blogs/${blog.handle}`}>{blog.handle}</Link></td>
                    <td><Link className='nav-link' to={`/blogs/${blog.handle}`}>TODO</Link></td>
                </tr> ) : null)
            }</tbody>
        </Table>
    );
}