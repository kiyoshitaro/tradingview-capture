# FROM node:20 AS builder

# USER node
# WORKDIR /home/node
# COPY package*.json ./
# RUN npm ci

# COPY --chown=node:node . .
# RUN npm run build \
#     && npm prune --omit=dev


# FROM node:20
# RUN if [ "$(uname -m)" != "x86_64" ]; then \
#     echo "Error: This Dockerfile requires the linux/amd64 platform." && \
#     echo "Please use: docker build --platform linux/amd64 ..." && \
#     exit 1; \
#     fi

# RUN apt-get update -y && apt-get install -y wget gnupg software-properties-common
# RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg
# RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list
# RUN apt-get update -y && apt-get install -y google-chrome-stable

# # ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

# USER node
# WORKDIR /home/node

# COPY --from=builder --chown=node:node /home/node/package*.json ./
# COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
# COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

# CMD ["node", "dist/main.js"]

# # ENTRYPOINT ["tail"]
# # CMD ["-f","/dev/null"]

FROM node:20
RUN apt-get update -y
RUN apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable
RUN apt-get install dbus -y

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
# ENTRYPOINT ["tail"]
# CMD ["-f","/dev/null"]

# docker build --platform=linux/amd64 -t tradingview-capture .
# docker run -p 8765:8765 tradingview-capture

# docker tag tradingview-capture hungnt98/tradingview-capture 
# docker build --platform=linux/amd64 -t hungnt98/tradingview-capture .
# docker push hungnt98/tradingview-capture