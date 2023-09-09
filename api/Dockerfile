FROM node:18.16.0-alpine as base

WORKDIR /app

# Add package file
COPY package*.json .
RUN npm install

COPY . .

RUN npm run build

FROM node:18.16.0-alpine as server
# Start production image build
# Copy node modules and build directory
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/dist /app/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["/app/dist/app.js"]