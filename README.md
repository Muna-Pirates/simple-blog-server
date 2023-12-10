Simple Blog Server

Simple Blog Server is a backend service built with NestJS, providing a GraphQL API for a blogging platform. It features user authentication, post creation, commenting, and category management.
Features

- User registration and authentication
- CRUD operations for blog posts
- Commenting on posts
- Assigning categories to posts
- Pagination and search for posts
- Role-based access control
  Getting Started

To get the server running locally:

- Clone this repo
- Install dependencies with npm install
- Start the server with npm run start:dev
  API Reference

The GraphQL schema is defined in src/schema.gql. Key operations include:

- registerUser: Register a new user
- loginUser: Authenticate a user and receive a JWT
- createPost: Create a new blog post
- listPosts: List posts with pagination
- addComment: Add a comment to a post
- searchPosts: Search for posts with given criteria
  Development

- Use npm run test to run unit tests
- Use npm run start:dev for development mode with hot reload
- Use npm run lint to run ESLint for code analysis
  Deployment

The CI/CD pipeline is configured in .github/workflows/ci-cd-pipeline.yml for deployment to AWS ECR and ECS.
Contributing

Contributions are welcome. Please follow the existing code style and add unit tests for any new or changed functionality.
License

This project is unlicensed and free for use.
