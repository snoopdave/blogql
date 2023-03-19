/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from "react";

interface HeadingProps {
    title?: String;
    heading: String;
}
export function Heading(props: HeadingProps) {
    return <div className='heading'>
        <h1>{props.title}</h1><p>{props.heading}</p>
    </div>
}