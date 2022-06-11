import {useQuery} from "@apollo/client";
import {BLOGS_QUERY} from "./graphql/queries";
import React from "react";
import {Table} from "react-bootstrap";

export interface BlogListProps {
    loggedIn: boolean;
}


export function BlogList(props: BlogListProps) {
    const { loading, error, data } = useQuery(BLOGS_QUERY);
    if (loading) {
        return (<img src='/loading-buffering.gif' alt='Loading...' />);
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
                    <td>{blog.handle}</td>
                    <td>TODO</td>
                </tr> ) : null)
            }</tbody>
        </Table>
    );
}