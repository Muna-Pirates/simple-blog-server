# /path/to/your/Dockerfile

# 1. Base Image
FROM node:latest as builder

# 2. Setting up working directory
WORKDIR /usr/src/app

# 3. Copy package.json and yarn.lock
COPY package*.json yarn.lock ./

# 4. Install dependencies
RUN yarn install --frozen-lockfile

# 5. Copy prisma schema
COPY prisma ./prisma/

# 6. Generate Prisma client
RUN npx prisma generate

# 7. Copy the rest of your application's source code
COPY . .

# 8. Build the application
RUN yarn build

# Stage 2: Run stage
FROM node:latest

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

# 9. Expose the port the app runs on
EXPOSE 3000

# 10. Define the command to run your app
CMD ["node", "dist/main"]
