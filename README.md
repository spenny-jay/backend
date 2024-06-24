# Welcome to the PlayerViz.io Backend!
PlayerViz.io is a web-application that eases evaluating player performances across an array of statistical categories. Rather than opening countless tabs, you can seamlessly create data visualizations and analyze individual performances on the platform. This backend repository holds the backbone of the service, routing requests and interfacing with AWS services. Below is additional information about this repository.

## Tech Stack
The backend follows the repository pattern when receiving requests following this order: client --> middleware layer --> repository layer --> AWS storage layer
1) Client: User interfacing the React web-application
2) Middleware Layer: Responsible with routing incoming requests and user auth (including tokens + refresh tokens)
3) Repository Layer: If a request requires interacting with either of the AWS storage services, this layer will contain the AWS SDK code perform CRUD operations.
4) AWS Storage Layer Consists of S3 to store player images and DynamoDB to store user data and player statistics

The latest player statistics are webscraped in a weekly EventBridge CRON job and either adds new players if they are not currently in the database or updates existing player stats.

## Endpoints
There are 3 major routes, each containing their own set of endpoints
1) /dashboards: A dashboard stores player statistics for a particular visualization. Contains subroutes to perform CRUD operations with DynamoDB.
2) /users: Middleware to issue tokens and refresh tokens upon a successful signup/login attempt. All subsequent requests will have their token authorized.
3) /players: Contains CRUD endpoints with DynamoDB and S3 for requested players

## Remaining Work
This project is borderline abandoned, but there are a handful of things that I may continue to work on
1) Incorporate HTTPS protocol
2) Deploy on AWS ECS
3) Swagger/Postman collection

