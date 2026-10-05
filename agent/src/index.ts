/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// Start command of the Render Workflow service. Importing the tasks registers them; the SDK
// starts the task server by itself when Render (or `render workflows dev`) runs this process.
import './tasks.js';
