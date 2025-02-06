# geohod

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### GitHub Actions deployment

Project includes GitHub Actions workflow that automatically builds and deploys the application new release published.

1. Builds the application
2. Creates a Docker image
3. Transfers the image to the production VPS
4. Runs container with the specified environment variables

Required GitHub Variables:
- `VPS_HOST` - VPS hostname or IP address

Required GitHub Secrets for deployment:
- `VPS_USER` - VPS username
- `VPS_SSH_KEY` - SSH private key for VPS access

### Optional GitHub Secrets for deployment
Both secrets and variables should follow the format: `VARIABLE_NAME=value`
- `SECRET_VARS` - Secret variables
- `ENV_VARS` - Environment variables
  - `GEOHOD_TELEGRAM_APP_REDIRECT_LINK` - Redirect link to telegram miniapp (https://t.me/geohodton_bot/app)