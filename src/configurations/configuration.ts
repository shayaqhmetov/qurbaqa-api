export default () => ({
  SWAGGER_TITLE: process.env.SWAGGER_TITLE || 'Qurbaqa API',
  SWAGGER_DESCRIPTION:
    process.env.SWAGGER_DESCRIPTION || 'API documentation for Qurbaqa',
  SWAGGER_VERSION: process.env.SWAGGER_VERSION || '1.0',
});
