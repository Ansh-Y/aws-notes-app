# Serverless Notes App 🚀

## Project Title

Serverless Notes Application Deployment using AWS and DevOps

## Live Application

http://my-notes-aura-app-bucket.s3-website-us-east-1.amazonaws.com

## Concepts Used

Amazon S3, AWS Lambda, Amazon API Gateway, Amazon DynamoDB, AWS IAM, OpenID Connect (OIDC), AWS SAM / CloudFormation, GitHub, GitHub Actions, CI/CD Pipeline

## Project Description

This project demonstrates a serverless notes application deployed on AWS using DevOps practices. The frontend is hosted on Amazon S3 as a static website, while the backend uses AWS Lambda functions exposed through Amazon API Gateway. Notes are stored in Amazon DynamoDB. The entire infrastructure and deployment process is automated using AWS SAM and a CI/CD pipeline implemented with GitHub Actions.

## Architecture

Frontend (HTML, CSS, JavaScript)
↓
Amazon S3 Static Website Hosting
↓
Amazon API Gateway
↓
AWS Lambda Functions
↓
Amazon DynamoDB

## Features

* Create notes
* View notes
* Delete notes
* Fully serverless architecture
* Automated deployment using CI/CD

## Technologies Used

* AWS (S3, Lambda, API Gateway, DynamoDB, IAM)
* AWS SAM / CloudFormation
* GitHub
* GitHub Actions
* HTML, CSS, JavaScript

## Deployment

The application is automatically deployed using GitHub Actions CI/CD pipeline which:

1. Builds the serverless application using AWS SAM
2. Deploys backend resources to AWS
3. Uploads frontend files to the S3 static website bucket

## Author

Ansh
