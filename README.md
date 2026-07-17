# NestJS S3 Upload Example

A simple NestJS application demonstrating different ways to upload and download files using an S3-compatible storage. The project uses **Garage** as a local S3 server running in Docker.

## Features

* Upload files using `multipart/form-data`
* Stream files directly to S3 without buffering them in memory
* Generate presigned upload URLs
* Generate presigned download URLs
* Download files from S3 through the application
* Swagger API documentation

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Rename `.env.example` file to `.env` file and configure your application and S3 credentials.

### 4. Start Garage

```bash
docker compose up -d
```

### 5. Create an S3 bucket

After Garage has started, create the bucket that will be used by the application.

List available buckets:

```bash
docker exec garage /garage bucket list
```

Create a bucket:

```bash
docker exec garage /garage bucket create <bucket-name>
```

> Replace `<bucket-name>` with the value `GARAGE_DEFAULT_BUCKET` configured in your `.env` file.

If your Garage configuration does **not** automatically grant bucket permissions, you'll also need to create an access key and allow it to access the bucket:

```bash
docker exec garage /garage key new app
docker exec garage /garage bucket allow --read --write --owner <bucket-name> --key app
```

Update your `.env` file with the generated access key ID and secret.

### 6. Run the application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

## API Documentation

Swagger UI is available after starting the application:

```text
http://localhost:4000/api/doc
```

## Available Endpoints

| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `POST` | `/storage/upload`        | Upload a file using `multipart/form-data` |
| `POST` | `/storage/stream`        | Stream raw request data directly to S3    |
| `POST` | `/storage/presigned-url` | Generate a presigned upload URL           |
| `GET`  | `/storage/:key`          | Generate a presigned download URL         |
| `GET`  | `/storage/stream/:key`   | Download a file through the application   |

## Project Structure

* **StorageModule** – storage module.
* **GarageProvider** – configures the S3 client.
* **GarageService** – implements storage operations.
* **StorageController** – exposes the REST API.
