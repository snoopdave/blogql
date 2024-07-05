-- Insert data
INSERT INTO Users (id, username, email, picture, created, updated)
VALUES
-- Generate 50 users
<% for (let i = 1; i <= 50; i++) { %>
('<%= uuidv4() %>', '<%= faker.internet.userName() %>', '<%= faker.internet.email() %>', '<%= faker.internet.avatar() %>', '<%= faker.date.past().toISOString() %>', '<%= faker.date.recent().toISOString() %>')<% if (i < 50) { %>,<% } %>
<% } %>;

-- Insert blogs
INSERT INTO Blogs (id, name, handle, created, updated, userId)
VALUES
<% for (let i = 1; i <= 50; i++) { %>
('<%= uuidv4() %>', 'Blog <%= i %>', '<%= faker.random.alphaNumeric(10) %>', '<%= faker.date.past().toISOString() %>', '<%= faker.date.recent().toISOString() %>', (SELECT id FROM Users LIMIT 1 OFFSET <%= i - 1 %>))<% if (i < 50) { %>,<% } %>
<% } %>;

-- Insert published entries
INSERT INTO Entries (id, title, content, created, updated, published, blogId)
VALUES
<% for (let i = 1; i <= 50; i++) { %>
  <% for (let j = 1; j <= 50; j++) { %>
    ('<%= uuidv4() %>', '<%= faker.lorem.words(5).substring(0, 30) %>', '<%= faker.lorem.words(50).substring(0, 130) %>', '<%= faker.date.past().toISOString() %>', '<%= faker.date.recent().toISOString() %>', '<%= faker.date.recent().toISOString() %>', (SELECT id FROM Blogs LIMIT 1 OFFSET <%= i - 1 %>))<% if (i < 50 || j < 50) { %>,<% } %>
  <% } %>
<% } %>;

-- Insert draft entries
INSERT INTO Entries (id, title, content, created, updated, blogId)
VALUES
<% for (let i = 1; i <= 50; i++) { %>
  <% for (let j = 1; j <= 25; j++) { %>
    ('<%= uuidv4() %>', '<%= faker.lorem.words(5).substring(0, 30) %>', '<%= faker.lorem.words(50).substring(0, 130) %>', '<%= faker.date.past().toISOString() %>', '<%= faker.date.recent().toISOString() %>', (SELECT id FROM Blogs LIMIT 1 OFFSET <%= i - 1 %>))<% if (i < 50 || j < 25) { %>,<% } %>
  <% } %>
<% } %>;

