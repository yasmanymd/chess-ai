FROM node:24.16.0-bookworm-slim AS development

WORKDIR /workspace

RUN npm install --global pnpm@11.22.0

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY --chown=node:node apps/server/package.json apps/server/package.json
COPY --chown=node:node apps/web/package.json apps/web/package.json

RUN chown -R node:node /workspace
USER node
RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

CMD ["sh"]

FROM development AS e2e

USER root
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN pnpm --filter @chess-ai/web exec playwright install --with-deps chromium
USER node

FROM development AS release-build

RUN pnpm --filter @chess-ai/server build && pnpm --filter @chess-ai/web build
